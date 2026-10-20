-- Configure cms_revalidation_url and cms_revalidation_secret in Supabase Vault.
-- The secret must match the Worker's CMS_REVALIDATION_SECRET.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

CREATE OR REPLACE FUNCTION public.notify_cms_cache_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  webhook_url text;
  webhook_secret text;
BEGIN
  SELECT decrypted_secret INTO webhook_url
  FROM vault.decrypted_secrets WHERE name = 'cms_revalidation_url';

  SELECT decrypted_secret INTO webhook_secret
  FROM vault.decrypted_secrets WHERE name = 'cms_revalidation_secret';

  IF coalesce(webhook_url, '') = '' OR coalesce(webhook_secret, '') = '' THEN
    RAISE WARNING 'CMS cache webhook is not configured in Vault';
    RETURN NULL;
  END IF;

  -- pg_net sends after commit; send table metadata only, never member records.
  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || webhook_secret
    ),
    body := jsonb_build_object(
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME,
      'type', TG_OP
    ),
    timeout_milliseconds := 10000
  );
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN
  -- Cache outages must not roll back CMS edits. Timed revalidation is the fallback.
  RAISE WARNING 'CMS cache webhook could not be queued (SQLSTATE %)', SQLSTATE;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_cms_cache_change()
  FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'cms_people',
    'users',
    'alumni_people',
    'user_public_group_memberships',
    'alumni_public_group_memberships',
    'cms_recruitment',
    'cms_statistics',
    'cms_timeline',
    'cms_sponsors',
    'resources'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS notify_cms_cache_change ON public.%I', table_name
    );
    -- Statement-level events avoid sending a notification for every imported row.
    EXECUTE format(
      'CREATE TRIGGER notify_cms_cache_change
       AFTER INSERT OR UPDATE OR DELETE ON public.%I
       FOR EACH STATEMENT EXECUTE FUNCTION public.notify_cms_cache_change()',
      table_name
    );
  END LOOP;
END;
$$;

COMMIT;
