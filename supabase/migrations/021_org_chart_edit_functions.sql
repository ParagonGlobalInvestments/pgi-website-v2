-- ============================================================================
-- Org chart edits as database functions
--
-- Every roster edit (move, add, undo, delete pod) runs in one function call:
-- one transaction, so a failure leaves nothing half-done, and an org-chart-wide
-- advisory lock, so concurrent edits run one after another instead of
-- interleaving. Permissions are checked inside the same transaction, against
-- current data.
--
-- Undo is server-held: each edit stores what it changed in
-- pod_changes.undo; the client only sends the change's id back. An undo
-- applies only if everything the change touched is still as it left it.
--
-- The API calls these with the service role, passing the signed-in editor
-- (`p_actor` = users.id, null for allowlist admins without a record, and
-- `p_is_admin`). They are not callable by anon/authenticated users.
--
-- Errors use PostgREST's PTxxx codes, which become the HTTP status:
-- PT400 bad input, PT403 not allowed, PT404 not found, PT409 conflict.
--
-- Pod leaders (pm or committee seat holders) may only move analysts between
-- the pods they lead and "Not in a pod yet", and reorder their pods'
-- analysts. This mirrors canMove() in src/lib/org-chart-rules.ts.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Change log: server-held undo
-- --------------------------------------------------------------------------
-- undo: { restore: [row...], remove: [id...], after: { id: row } }
--   restore: rows as they were before the edit (changed or deleted by it)
--   remove:  ids of rows the edit created
--   after:   the edit's result for those rows (absent = deleted)
ALTER TABLE pod_changes ADD COLUMN IF NOT EXISTS undo jsonb;
ALTER TABLE pod_changes ADD COLUMN IF NOT EXISTS undone_at timestamptz;

-- --------------------------------------------------------------------------
-- 2. At most one "Not in a pod yet" row per user, and none for users who
--    are in a pod. Clean up existing data first.
-- --------------------------------------------------------------------------
DELETE FROM pod_members u
WHERE u.pod_id IS NULL
  AND u.user_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM pod_members p
    WHERE p.user_id = u.user_id AND p.pod_id IS NOT NULL
  );

DELETE FROM pod_members u
USING pod_members k
WHERE u.pod_id IS NULL
  AND k.pod_id IS NULL
  AND u.user_id = k.user_id
  AND u.id > k.id;

CREATE UNIQUE INDEX IF NOT EXISTS pod_members_one_unassigned_per_user
  ON pod_members (user_id)
  WHERE pod_id IS NULL AND user_id IS NOT NULL;

-- --------------------------------------------------------------------------
-- 3. Helpers
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION org_chart_fail(p_code text, p_message text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = p_code, MESSAGE = p_message;
END;
$$;

CREATE OR REPLACE FUNCTION org_chart_row_json(m pod_members)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT jsonb_build_object(
    'id', m.id,
    'pod_id', m.pod_id,
    'user_id', m.user_id,
    'name', m.name,
    'seat', m.seat,
    'sort_order', m.sort_order
  );
$$;

-- Same person: same user, or (no user) same sheet name.
CREATE OR REPLACE FUNCTION org_chart_same_person(a pod_members, b pod_members)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT coalesce(
    CASE
      WHEN b.user_id IS NOT NULL THEN a.user_id = b.user_id
      ELSE a.user_id IS NULL AND a.name = b.name
    END,
    false
  );
$$;

CREATE OR REPLACE FUNCTION org_chart_person_name(m pod_members)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT u.name FROM users u WHERE u.id = m.user_id),
    m.name,
    'Someone'
  );
$$;

CREATE OR REPLACE FUNCTION org_chart_pod_label(p_pod uuid)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT 'Pod ' || number FROM pods WHERE id = p_pod),
    'Not in a pod'
  );
$$;

-- Pods the user leads (PM or ICOMM/QCOMM).
CREATE OR REPLACE FUNCTION org_chart_led_pods(p_user uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(array_agg(DISTINCT pod_id), '{}')
  FROM pod_members
  WHERE p_user IS NOT NULL
    AND user_id = p_user
    AND pod_id IS NOT NULL
    AND seat IN ('committee', 'pm');
$$;

-- Whether a pod leader (leading p_led) may move a placement. A placement
-- with no pod counts as an analyst whatever seat it last held.
CREATE OR REPLACE FUNCTION org_chart_leader_may_move(
  p_led uuid[],
  p_from_pod uuid,
  p_from_seat text,
  p_to_pod uuid,
  p_to_seat text
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN (CASE WHEN p_from_pod IS NULL THEN 'analyst' ELSE p_from_seat END)
           <> 'analyst'
      OR (CASE WHEN p_to_pod IS NULL THEN 'analyst' ELSE p_to_seat END)
           <> 'analyst'
      THEN false
    -- Reordering a list: only their own pods, never "Not in a pod yet".
    WHEN p_from_pod IS NOT DISTINCT FROM p_to_pod
      THEN p_to_pod IS NOT NULL AND p_to_pod = ANY (p_led)
    ELSE (p_from_pod IS NULL OR p_from_pod = ANY (p_led))
     AND (p_to_pod IS NULL OR p_to_pod = ANY (p_led))
  END;
$$;

-- Next position at the end of a list: a pod's analysts, or (null) the
-- people not in a pod.
CREATE OR REPLACE FUNCTION org_chart_next_sort(p_pod uuid)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(max(sort_order) + 1, 0)
  FROM pod_members
  WHERE (p_pod IS NULL AND pod_id IS NULL)
     OR (pod_id = p_pod AND seat = 'analyst');
$$;

-- Put a row at p_index in its list and renumber the list 0..n-1 (ties on
-- sort_order break by id, as the roster read does). Only sort_order is
-- written.
CREATE OR REPLACE FUNCTION org_chart_place(
  p_pod uuid,
  p_row uuid,
  p_index integer
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  WITH list AS (
    SELECT id, row_number() OVER (ORDER BY sort_order, id) - 1 AS pos
    FROM pod_members
    WHERE ((p_pod IS NULL AND pod_id IS NULL)
        OR (pod_id = p_pod AND seat = 'analyst'))
      AND id <> p_row
  ),
  slot AS (
    SELECT least(greatest(p_index, 0), count(*))::integer AS at FROM list
  ),
  ordered AS (
    SELECT l.id, CASE WHEN l.pos < s.at THEN l.pos ELSE l.pos + 1 END AS pos
    FROM list l, slot s
    UNION ALL
    SELECT p_row, s.at FROM slot s
  )
  UPDATE pod_members m
  SET sort_order = o.pos
  FROM ordered o
  WHERE m.id = o.id AND m.sort_order IS DISTINCT FROM o.pos;
END;
$$;

-- Take a placement out of its pod: delete it when the person has another
-- placement (so they don't also show as "Not in a pod yet"), otherwise keep
-- them on the roster with no pod. Returns true when kept.
CREATE OR REPLACE FUNCTION org_chart_vacate(p_row pod_members)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pod_members p
    WHERE p.id <> p_row.id AND org_chart_same_person(p, p_row)
  ) THEN
    DELETE FROM pod_members WHERE id = p_row.id;
    RETURN false;
  END IF;

  UPDATE pod_members
  SET pod_id = NULL, seat = 'analyst', sort_order = org_chart_next_sort(NULL)
  WHERE id = p_row.id;
  RETURN true;
END;
$$;

-- Rows an edit can touch: the pods involved, the people not in a pod, and
-- every placement of the person moved. Keyed by id.
CREATE OR REPLACE FUNCTION org_chart_scope(
  p_pods uuid[],
  p_user uuid,
  p_name text
)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT coalesce(jsonb_object_agg(m.id::text, org_chart_row_json(m)), '{}')
  FROM pod_members m
  WHERE m.pod_id = ANY (p_pods)
     OR m.pod_id IS NULL
     OR (p_user IS NOT NULL AND m.user_id = p_user)
     OR (p_user IS NULL AND m.user_id IS NULL AND m.name = p_name);
$$;

-- Log an edit with its undo (the difference between two scope snapshots).
-- Returns the change id, or null when nothing changed.
CREATE OR REPLACE FUNCTION org_chart_record(
  p_actor uuid,
  p_actor_name text,
  p_action text,
  p_summary text,
  p_details jsonb,
  p_before jsonb,
  p_after jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_restore jsonb;
  v_remove jsonb;
  v_after jsonb;
  v_id uuid;
BEGIN
  SELECT coalesce(jsonb_agg(b.value), '[]')
  INTO v_restore
  FROM jsonb_each(p_before) b
  WHERE (p_after -> b.key) IS DISTINCT FROM b.value;

  SELECT coalesce(jsonb_agg(a.key), '[]')
  INTO v_remove
  FROM jsonb_each(p_after) a
  WHERE NOT p_before ? a.key;

  IF v_restore = '[]' AND v_remove = '[]' THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(jsonb_object_agg(a.key, a.value), '{}')
  INTO v_after
  FROM jsonb_each(p_after) a
  WHERE (p_before -> a.key) IS DISTINCT FROM a.value;

  INSERT INTO pod_changes (actor_user_id, actor_name, action, summary, details, undo)
  VALUES (
    p_actor,
    p_actor_name,
    p_action,
    p_summary,
    coalesce(p_details, '{}'),
    jsonb_build_object('restore', v_restore, 'remove', v_remove, 'after', v_after)
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION org_chart_lock()
RETURNS void
LANGUAGE sql
AS $$
  SELECT pg_advisory_xact_lock(hashtext('org_chart_edit'));
$$;

-- --------------------------------------------------------------------------
-- 4. Edits
-- --------------------------------------------------------------------------

-- Move a placement to a pod (null: out of every pod) and seat, at p_index in
-- the target list (null: the end). Within the same list this reorders.
-- Filling a lead seat displaces its holder: a PM becomes the last analyst
-- in the pod; an ICOMM/QCOMM member leaves the pod. p_copy (admins,
-- committee seat only) adds a placement instead of moving this one.
-- Returns { changeId, summary }, or null when nothing changed.
CREATE OR REPLACE FUNCTION org_chart_move(
  p_actor uuid,
  p_actor_name text,
  p_is_admin boolean,
  p_member uuid,
  p_pod uuid,
  p_seat text,
  p_copy boolean,
  p_index integer
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  r pod_members;
  v_holder pod_members;
  v_has_holder boolean := false;
  v_to_program text;
  v_to_number integer;
  v_seat text := CASE WHEN p_pod IS NULL THEN 'analyst' ELSE p_seat END;
  v_copy boolean;
  v_name text;
  v_holder_name text;
  v_kept boolean;
  v_before jsonb;
  v_change uuid;
  v_summary text;
  v_seat_label text;
BEGIN
  PERFORM org_chart_lock();

  IF p_seat IS NULL OR p_seat NOT IN ('committee', 'pm', 'analyst') THEN
    PERFORM org_chart_fail('PT400', 'Invalid seat');
  END IF;
  IF p_index IS NOT NULL AND p_index < 0 THEN
    PERFORM org_chart_fail('PT400', 'Invalid position');
  END IF;

  SELECT * INTO r FROM pod_members WHERE id = p_member;
  IF NOT FOUND THEN
    PERFORM org_chart_fail('PT404', 'That person is no longer on the roster');
  END IF;

  IF p_pod IS NOT NULL THEN
    SELECT program, number INTO v_to_program, v_to_number
    FROM pods WHERE id = p_pod;
    IF NOT FOUND THEN
      PERFORM org_chart_fail('PT404', 'Pod not found');
    END IF;
    IF v_seat = 'pm' AND v_to_program = 'quant' THEN
      PERFORM org_chart_fail('PT400', 'Systematic pods have no Pod Leader seat');
    END IF;
  END IF;

  IF coalesce(p_copy, false) AND v_seat <> 'committee' THEN
    PERFORM org_chart_fail('PT400', 'Only ICOMM/QCOMM seats can be shared across pods');
  END IF;

  IF NOT p_is_admin AND (
    coalesce(p_copy, false)
    OR NOT org_chart_leader_may_move(
      org_chart_led_pods(p_actor), r.pod_id, r.seat, p_pod, v_seat
    )
  ) THEN
    PERFORM org_chart_fail(
      'PT403',
      'Pod leaders can only move analysts between their pod and "Not in a pod yet"'
    );
  END IF;

  v_copy := coalesce(p_copy, false)
    AND r.pod_id IS NOT NULL
    AND r.pod_id IS DISTINCT FROM p_pod;
  v_name := org_chart_person_name(r);
  v_before := org_chart_scope(ARRAY[r.pod_id, p_pod], r.user_id, r.name);

  -- Reordering within one list.
  IF NOT v_copy
     AND r.pod_id IS NOT DISTINCT FROM p_pod
     AND (p_pod IS NULL OR (r.seat = 'analyst' AND v_seat = 'analyst')) THEN
    IF p_index IS NULL THEN
      RETURN NULL;
    END IF;
    PERFORM org_chart_place(p_pod, r.id, p_index);
    v_summary := format(
      'Moved %s to #%s in %s',
      v_name,
      least(p_index + 1, (SELECT count(*) FROM pod_members m
                          WHERE (p_pod IS NULL AND m.pod_id IS NULL)
                             OR (m.pod_id = p_pod AND m.seat = 'analyst'))),
      CASE WHEN p_pod IS NULL THEN '"Not in a pod yet"' ELSE 'Pod ' || v_to_number END
    );
    v_change := org_chart_record(
      p_actor, p_actor_name, 'move', v_summary,
      jsonb_build_object('memberId', r.id, 'podId', p_pod, 'index', p_index, 'reorder', true),
      v_before,
      org_chart_scope(ARRAY[r.pod_id, p_pod], r.user_id, r.name)
    );
    RETURN CASE WHEN v_change IS NULL THEN NULL
      ELSE jsonb_build_object('changeId', v_change, 'summary', v_summary) END;
  END IF;

  -- Already in that lead seat.
  IF NOT v_copy AND r.pod_id IS NOT DISTINCT FROM p_pod AND r.seat = v_seat THEN
    RETURN NULL;
  END IF;

  IF p_pod IS NOT NULL AND EXISTS (
    SELECT 1 FROM pod_members p
    WHERE p.id <> r.id AND p.pod_id = p_pod AND org_chart_same_person(p, r)
  ) THEN
    PERFORM org_chart_fail('PT409', format('%s is already in Pod %s', v_name, v_to_number));
  END IF;

  -- Vacate the lead seat first so the one-holder-per-seat index never trips.
  IF p_pod IS NOT NULL AND v_seat IN ('committee', 'pm') THEN
    SELECT * INTO v_holder FROM pod_members
    WHERE pod_id = p_pod AND seat = v_seat AND id <> r.id
    LIMIT 1;
    v_has_holder := FOUND;
    IF v_has_holder THEN
      v_holder_name := org_chart_person_name(v_holder);
      IF v_seat = 'pm' THEN
        UPDATE pod_members
        SET seat = 'analyst', sort_order = org_chart_next_sort(p_pod)
        WHERE id = v_holder.id;
      ELSE
        PERFORM org_chart_vacate(v_holder);
      END IF;
    END IF;
  END IF;

  IF v_copy THEN
    INSERT INTO pod_members (pod_id, user_id, name, seat, sort_order)
    VALUES (
      p_pod,
      r.user_id,
      CASE WHEN r.user_id IS NULL THEN r.name END,
      v_seat,
      0
    );
  ELSIF p_pod IS NULL THEN
    v_kept := org_chart_vacate(r);
    -- Only admins order "Not in a pod yet"; leaders' moves go to the end.
    IF v_kept AND p_index IS NOT NULL AND p_is_admin THEN
      PERFORM org_chart_place(NULL, r.id, p_index);
    END IF;
  ELSE
    UPDATE pod_members
    SET pod_id = p_pod,
        seat = v_seat,
        sort_order = CASE
          WHEN r.pod_id IS NOT DISTINCT FROM p_pod THEN r.sort_order
          ELSE org_chart_next_sort(p_pod)
        END
    WHERE id = r.id;
    IF v_seat = 'analyst' AND p_index IS NOT NULL THEN
      PERFORM org_chart_place(p_pod, r.id, p_index);
    END IF;
  END IF;

  IF p_pod IS NOT NULL AND v_seat IN ('committee', 'pm') THEN
    v_seat_label := CASE
      WHEN v_seat = 'pm' THEN 'Pod Leader'
      WHEN v_to_program = 'value' THEN 'ICOMM'
      ELSE 'QCOMM'
    END;
    v_summary := format(
      '%s %s %s of Pod %s',
      CASE WHEN v_copy THEN 'Added' ELSE 'Made' END,
      v_name, v_seat_label, v_to_number
    );
    IF v_has_holder THEN
      v_summary := v_summary || ', replacing ' || v_holder_name;
    END IF;
  ELSIF r.pod_id IS NOT DISTINCT FROM p_pod THEN
    v_summary := format('Moved %s to Analyst in Pod %s', v_name, v_to_number);
  ELSE
    v_summary := format(
      'Moved %s from %s to %s',
      v_name, org_chart_pod_label(r.pod_id), org_chart_pod_label(p_pod)
    );
  END IF;

  v_change := org_chart_record(
    p_actor, p_actor_name, 'move', v_summary,
    jsonb_build_object(
      'memberId', r.id,
      'from', jsonb_build_object('podId', r.pod_id, 'seat', r.seat),
      'to', jsonb_build_object('podId', p_pod, 'seat', v_seat),
      'copy', v_copy,
      'displacedId', CASE WHEN v_has_holder THEN v_holder.id END
    ),
    v_before,
    org_chart_scope(ARRAY[r.pod_id, p_pod], r.user_id, r.name)
  );
  RETURN CASE WHEN v_change IS NULL THEN NULL
    ELSE jsonb_build_object('changeId', v_change, 'summary', v_summary) END;
END;
$$;

-- Admins: add an active member who isn't on the roster, as an analyst.
CREATE OR REPLACE FUNCTION org_chart_add_member(
  p_actor uuid,
  p_actor_name text,
  p_is_admin boolean,
  p_user uuid,
  p_pod uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_status text;
  v_number integer;
  v_before jsonb;
  v_summary text;
  v_change uuid;
BEGIN
  PERFORM org_chart_lock();
  IF NOT p_is_admin THEN
    PERFORM org_chart_fail('PT403', 'Only admins can do that');
  END IF;

  SELECT name, status INTO v_name, v_status FROM users WHERE id = p_user;
  IF NOT FOUND OR v_status <> 'active' THEN
    PERFORM org_chart_fail('PT404', 'Member not found');
  END IF;
  IF EXISTS (SELECT 1 FROM pod_members WHERE user_id = p_user) THEN
    PERFORM org_chart_fail('PT409', v_name || ' is already on the org chart');
  END IF;
  IF p_pod IS NOT NULL THEN
    SELECT number INTO v_number FROM pods WHERE id = p_pod;
    IF NOT FOUND THEN
      PERFORM org_chart_fail('PT404', 'Pod not found');
    END IF;
  END IF;

  v_before := org_chart_scope(ARRAY[p_pod], p_user, NULL);
  INSERT INTO pod_members (pod_id, user_id, seat, sort_order)
  VALUES (p_pod, p_user, 'analyst', org_chart_next_sort(p_pod));

  v_summary := CASE
    WHEN p_pod IS NULL THEN 'Added ' || v_name || ' to the roster'
    ELSE 'Added ' || v_name || ' to Pod ' || v_number
  END;
  v_change := org_chart_record(
    p_actor, p_actor_name, 'add_member', v_summary,
    jsonb_build_object('userId', p_user, 'podId', p_pod),
    v_before,
    org_chart_scope(ARRAY[p_pod], p_user, NULL)
  );
  RETURN jsonb_build_object('changeId', v_change, 'summary', v_summary);
END;
$$;

-- Undo an edit by its change id. Only the editor who made it (or an admin);
-- only once; only if everything it touched is still as it left it; and for
-- pod leaders, only while it's still within the pods they lead.
CREATE OR REPLACE FUNCTION org_chart_undo(
  p_actor uuid,
  p_actor_name text,
  p_is_admin boolean,
  p_change uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  c pod_changes;
  v_restore jsonb;
  v_remove jsonb;
  v_after jsonb;
  v_led uuid[];
  x jsonb;
  v_expected jsonb;
  v_id text;
  cur pod_members;
  v_summary text;
BEGIN
  PERFORM org_chart_lock();

  SELECT * INTO c FROM pod_changes WHERE id = p_change;
  IF NOT FOUND OR c.undo IS NULL THEN
    PERFORM org_chart_fail('PT404', 'There is nothing to undo');
  END IF;
  IF c.undone_at IS NOT NULL THEN
    PERFORM org_chart_fail('PT409', 'That change was already undone');
  END IF;
  IF NOT p_is_admin AND c.actor_user_id IS DISTINCT FROM p_actor THEN
    PERFORM org_chart_fail('PT403', 'You can only undo your own changes');
  END IF;

  v_restore := c.undo -> 'restore';
  v_remove := c.undo -> 'remove';
  v_after := c.undo -> 'after';

  -- Everything the change touched must still be as it left it.
  FOR x IN SELECT value FROM jsonb_array_elements(v_restore) LOOP
    v_expected := v_after -> (x ->> 'id');
    SELECT * INTO cur FROM pod_members WHERE id = (x ->> 'id')::uuid;
    IF (v_expected IS NULL AND FOUND)
       OR (v_expected IS NOT NULL AND (
         NOT FOUND
         OR cur.pod_id IS DISTINCT FROM (v_expected ->> 'pod_id')::uuid
         OR cur.seat IS DISTINCT FROM v_expected ->> 'seat'
       )) THEN
      PERFORM org_chart_fail(
        'PT409',
        'Someone has changed these people since, so this can''t be undone'
      );
    END IF;
  END LOOP;
  FOR v_id IN SELECT value FROM jsonb_array_elements_text(v_remove) LOOP
    v_expected := v_after -> v_id;
    SELECT * INTO cur FROM pod_members WHERE id = v_id::uuid;
    IF NOT FOUND
       OR cur.pod_id IS DISTINCT FROM (v_expected ->> 'pod_id')::uuid
       OR cur.seat IS DISTINCT FROM v_expected ->> 'seat' THEN
      PERFORM org_chart_fail(
        'PT409',
        'Someone has changed these people since, so this can''t be undone'
      );
    END IF;
  END LOOP;

  -- Pod leaders: the undo must itself be a move they could make now.
  IF NOT p_is_admin THEN
    v_led := org_chart_led_pods(p_actor);
    IF jsonb_array_length(v_remove) > 0 THEN
      PERFORM org_chart_fail('PT403', 'Only admins can undo that');
    END IF;
    FOR x IN SELECT value FROM jsonb_array_elements(v_restore) LOOP
      v_expected := v_after -> (x ->> 'id');
      -- Only its position changed (a reorder side effect): fine within
      -- their pods or "Not in a pod yet".
      CONTINUE WHEN v_expected IS NOT NULL
        AND (v_expected ->> 'pod_id') IS NOT DISTINCT FROM (x ->> 'pod_id')
        AND (v_expected ->> 'seat') = (x ->> 'seat')
        AND ((x ->> 'pod_id') IS NULL OR (x ->> 'pod_id')::uuid = ANY (v_led));
      IF NOT org_chart_leader_may_move(
        v_led,
        (v_expected ->> 'pod_id')::uuid,
        coalesce(v_expected ->> 'seat', 'analyst'),
        (x ->> 'pod_id')::uuid,
        x ->> 'seat'
      ) THEN
        PERFORM org_chart_fail('PT403', 'Only admins can undo that');
      END IF;
    END LOOP;
  END IF;

  DELETE FROM pod_members
  WHERE id IN (SELECT value::uuid FROM jsonb_array_elements_text(v_remove));

  -- Put rows back without lead seats first, then fill the seats, so the
  -- one-holder-per-seat index never sees two holders.
  INSERT INTO pod_members (id, pod_id, user_id, name, seat, sort_order)
  SELECT
    (item ->> 'id')::uuid,
    (item ->> 'pod_id')::uuid,
    (item ->> 'user_id')::uuid,
    item ->> 'name',
    CASE WHEN item ->> 'seat' IN ('committee', 'pm') THEN 'analyst' ELSE item ->> 'seat' END,
    (item ->> 'sort_order')::integer
  FROM jsonb_array_elements(v_restore) AS t(item)
  ON CONFLICT (id) DO UPDATE
  SET pod_id = EXCLUDED.pod_id,
      user_id = EXCLUDED.user_id,
      name = EXCLUDED.name,
      seat = EXCLUDED.seat,
      sort_order = EXCLUDED.sort_order;

  UPDATE pod_members m
  SET seat = t.item ->> 'seat'
  FROM jsonb_array_elements(v_restore) AS t(item)
  WHERE m.id = (t.item ->> 'id')::uuid
    AND t.item ->> 'seat' IN ('committee', 'pm');

  UPDATE pod_changes SET undone_at = now() WHERE id = c.id;

  v_summary := left('Undid: ' || c.summary, 400);
  INSERT INTO pod_changes (actor_user_id, actor_name, action, summary, details)
  VALUES (p_actor, p_actor_name, 'undo', v_summary, jsonb_build_object('changeId', c.id));
  RETURN jsonb_build_object('summary', v_summary);
END;
$$;

-- Admins: delete a pod. Its people move to "Not in a pod yet" (or, if they
-- have another placement, just leave the pod).
CREATE OR REPLACE FUNCTION org_chart_delete_pod(
  p_actor uuid,
  p_actor_name text,
  p_is_admin boolean,
  p_pod uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_number integer;
  r pod_members;
  n integer := 0;
  v_summary text;
BEGIN
  PERFORM org_chart_lock();
  IF NOT p_is_admin THEN
    PERFORM org_chart_fail('PT403', 'Only admins can do that');
  END IF;
  SELECT number INTO v_number FROM pods WHERE id = p_pod;
  IF NOT FOUND THEN
    PERFORM org_chart_fail('PT404', 'Pod not found');
  END IF;

  -- pod_members cascades on pod delete, so move people out first.
  -- In display order: leads, then analysts.
  FOR r IN
    SELECT * FROM pod_members WHERE pod_id = p_pod
    ORDER BY CASE seat WHEN 'committee' THEN 0 WHEN 'pm' THEN 1 ELSE 2 END,
             sort_order, id
  LOOP
    PERFORM org_chart_vacate(r);
    n := n + 1;
  END LOOP;
  DELETE FROM pods WHERE id = p_pod;

  v_summary := 'Deleted Pod ' || v_number
    || CASE WHEN n = 0 THEN ''
            WHEN n = 1 THEN ' (1 person moved out)'
            ELSE ' (' || n || ' people moved out)' END;
  INSERT INTO pod_changes (actor_user_id, actor_name, action, summary, details)
  VALUES (p_actor, p_actor_name, 'delete_pod', v_summary,
          jsonb_build_object('podId', p_pod, 'number', v_number));
  RETURN jsonb_build_object('summary', v_summary);
END;
$$;

-- --------------------------------------------------------------------------
-- 5. Access: service role only
-- --------------------------------------------------------------------------
DO $$
DECLARE
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'org_chart_fail(text, text)',
    'org_chart_row_json(pod_members)',
    'org_chart_same_person(pod_members, pod_members)',
    'org_chart_person_name(pod_members)',
    'org_chart_pod_label(uuid)',
    'org_chart_led_pods(uuid)',
    'org_chart_leader_may_move(uuid[], uuid, text, uuid, text)',
    'org_chart_next_sort(uuid)',
    'org_chart_place(uuid, uuid, integer)',
    'org_chart_vacate(pod_members)',
    'org_chart_scope(uuid[], uuid, text)',
    'org_chart_record(uuid, text, text, text, jsonb, jsonb, jsonb)',
    'org_chart_lock()',
    'org_chart_move(uuid, text, boolean, uuid, uuid, text, boolean, integer)',
    'org_chart_add_member(uuid, text, boolean, uuid, uuid)',
    'org_chart_undo(uuid, text, boolean, uuid)',
    'org_chart_delete_pod(uuid, text, boolean, uuid)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END;
$$;
