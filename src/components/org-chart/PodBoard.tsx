'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Active,
  type ClientRect,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { UndoSnapshot } from '@/lib/org-chart-edit';
import {
  canMove,
  isLeadSeat,
  ledPodIds,
  moveLocally,
  podHasSeat,
  podLeadSeats,
  rosterPlacements,
  type MoveTarget,
} from '@/lib/org-chart-rules';
import type {
  OrgChartViewer,
  Pod,
  PodMember,
  PodRoster,
  UserProgram,
} from '@/types';
import { AddPersonDialog } from './AddPersonDialog';
import {
  BoardProvider,
  MemberChip,
  UNASSIGNED,
  Zone,
  containerId,
  containerTarget,
  isSeatContainer,
  type BoardApi,
  type ZoneData,
} from './board';
import { ChangeLogDialog } from './ChangeLogDialog';
import { PersonName } from './PersonName';
import { PodCard } from './PodCard';

const PROGRAMS: UserProgram[] = ['value', 'quant'];

// The quant program is "Systematic" in officer titles; match it here.
const PROGRAM_HEADINGS: Record<UserProgram, string> = {
  value: 'Value pods',
  quant: 'Systematic pods',
};

/** Editing is offered from Tailwind's `lg` breakpoint up. */
const EDIT_MEDIA_QUERY = '(min-width: 1024px)';

interface EditResult {
  roster: PodRoster;
  undo: UndoSnapshot | null;
}

/** Container id → ids of the people in it, in display order. */
type Containers = Record<string, string[]>;

function containersOf(roster: PodRoster): Containers {
  const out: Containers = { [UNASSIGNED]: roster.unassigned.map(m => m.id) };
  for (const pod of roster.pods) {
    for (const seat of [...podLeadSeats(pod), 'analyst' as const]) {
      out[containerId(pod.id, seat)] = pod.members
        .filter(m => m.seat === seat)
        .map(m => m.id);
    }
  }
  return out;
}

function findContainer(containers: Containers, id: UniqueIdentifier) {
  return Object.keys(containers).find(c => containers[c].includes(String(id)));
}

/** Move `id` into container `to` at `index` (removing it from wherever). */
function placeIn(
  containers: Containers,
  id: string,
  to: string,
  index: number
): Containers {
  const next: Containers = {};
  for (const [c, ids] of Object.entries(containers)) {
    next[c] = ids.filter(x => x !== id);
  }
  const list = next[to] ?? [];
  const at = Math.max(0, Math.min(index, list.length));
  next[to] = [...list.slice(0, at), id, ...list.slice(at)];
  return next;
}

/** Whether the dragged item's centre is past the middle of `over`. */
function isAfter(active: Active, over: ClientRect): boolean {
  const rect = active.rect.current.translated;
  if (!rect) return false;
  const dy = rect.top + rect.height / 2 - (over.top + over.height / 2);
  const dx = rect.left + rect.width / 2 - (over.left + over.width / 2);
  // Below the item, or level with it and to its right (wrapping grids).
  return dy > over.height / 2 || (Math.abs(dy) <= over.height / 2 && dx > 0);
}

interface DragState {
  member: PodMember;
  origin: string;
  originIndex: number;
  /** Where everyone would be if the drag ended now. */
  containers: Containers;
}

export function SectionHeader({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 border-b border-gray-200 pb-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
        {title}
      </h2>
      <p className="text-xs text-gray-500">{detail}</p>
    </div>
  );
}

/**
 * Pods in two independent stacks (alternating left/right, so pods 1 and 2
 * share the top row) with the same gap everywhere; a tall card doesn't push
 * down the card beside it.
 */
function PodStacks({ pods }: { pods: Pod[] }) {
  const stacks = [0, 1].map(col => pods.filter((_, i) => i % 2 === col));
  return (
    <div className="grid grid-cols-2 gap-4">
      {stacks.map((stack, col) => (
        <div key={col} className="flex flex-col gap-4">
          {stack.map(pod => (
            <PodCard key={pod.id} pod={pod} />
          ))}
        </div>
      ))}
    </div>
  );
}

function EditHint({
  viewer,
  led,
  pods,
}: {
  viewer: OrgChartViewer;
  led: Set<string>;
  pods: Pod[];
}) {
  if (viewer.isAdmin) {
    return (
      <>
        Drag people between pods, onto a seat, out to &ldquo;Not in a pod
        yet&rdquo;, or up and down to reorder. Changes save as soon as you drop.
      </>
    );
  }
  const names = pods
    .filter(p => led.has(p.id))
    .map(p => `Pod ${p.number}`)
    .join(', ');
  return (
    <>
      You can move analysts between {names} and &ldquo;Not in a pod yet&rdquo;,
      and reorder {names}. Changes save as soon as you drop.
    </>
  );
}

export function PodBoard({
  initialRoster,
  viewer,
  programDetails,
}: {
  initialRoster: PodRoster;
  viewer: OrgChartViewer;
  /** Header detail per program, e.g. "COO (Value): Jane Doe". */
  programDetails: Record<UserProgram, string>;
}) {
  const [roster, setRoster] = useState(initialRoster);
  const [editing, setEditing] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  // Only the latest request's answer is applied, so quick successive drops
  // can't be overwritten by an older response arriving late.
  const latest = useRef(0);

  const led = useMemo(
    () => ledPodIds(rosterPlacements(roster), viewer.userId),
    [roster, viewer.userId]
  );
  const canEdit = viewer.isAdmin || led.size > 0;

  // Leave edit mode if the window narrows past the desktop breakpoint.
  useEffect(() => {
    if (!editing) return;
    const mq = window.matchMedia(EDIT_MEDIA_QUERY);
    const onChange = () => !mq.matches && setEditing(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [editing]);

  const refresh = useCallback(async () => {
    const mine = ++latest.current;
    try {
      const res = await fetch('/api/org-chart/roster');
      const json = await res.json();
      if (json.success && mine === latest.current) setRoster(json.data);
    } catch {
      // Keep what's on screen; the next edit will resync.
    }
  }, []);

  const send = useCallback(
    async (
      url: string,
      method: string,
      body?: unknown
    ): Promise<EditResult | null> => {
      const mine = ++latest.current;
      try {
        const res = await fetch(url, {
          method,
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          throw new Error(json?.error ?? 'Could not save the change');
        }
        if (mine === latest.current) setRoster(json.data.roster);
        return json.data as EditResult;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Could not save the change'
        );
        if (mine === latest.current) void refresh();
        return null;
      }
    },
    [refresh]
  );

  const offerUndo = useCallback(
    (undo: UndoSnapshot) => {
      toast.success(undo.summary, {
        duration: 8000,
        action: {
          label: 'Undo',
          onClick: () => {
            void send('/api/org-chart/undo', 'POST', undo).then(
              done => done && toast.success('Change undone')
            );
          },
        },
      });
    },
    [send]
  );

  const baseContainers = useMemo(() => containersOf(roster), [roster]);
  const byId = useMemo(
    () => new Map(rosterPlacements(roster).map(m => [m.id, m])),
    [roster]
  );

  const api: BoardApi = useMemo(() => {
    const allows = (member: PodMember, target: MoveTarget) => {
      const pod = roster.pods.find(p => p.id === target.podId);
      if (target.podId && (!pod || !podHasSeat(pod.program, target.seat))) {
        return false;
      }
      // Already in that seat. (Within a list, moving means reordering.)
      if (
        isLeadSeat(target.seat) &&
        member.podId === target.podId &&
        member.seat === target.seat
      ) {
        return false;
      }
      return canMove(viewer, led, member, target);
    };
    const containers = drag?.containers ?? baseContainers;

    return {
      editing,
      viewer,
      roster,
      dragging: drag?.member ?? null,
      items: id =>
        (containers[id] ?? []).flatMap(m => {
          const member = byId.get(m);
          return member ? [member] : [];
        }),
      allows,
      canDrag: member =>
        viewer.isAdmin ||
        (led.size > 0 &&
          (member.podId === null ||
            (led.has(member.podId) && member.seat === 'analyst'))),

      move: async (member, target, opts = {}) => {
        if (!opts.copy) {
          if (!allows(member, target)) return;
          setRoster(r => moveLocally(r, member.id, target, opts.index));
        }
        const done = await send('/api/org-chart/members/move', 'POST', {
          memberId: member.id,
          podId: target.podId,
          seat: target.seat,
          copy: opts.copy ?? false,
          index: opts.index,
        });
        if (done?.undo) offerUndo(done.undo);
      },

      updateFocus: async (pod, focus) => {
        setRoster(r => ({
          ...r,
          pods: r.pods.map(p =>
            p.id === pod.id ? { ...p, focus: focus || null } : p
          ),
        }));
        return !!(await send(`/api/org-chart/pods/${pod.id}`, 'PATCH', {
          focus,
        }));
      },

      deletePod: async pod => {
        const n = pod.members.length;
        const people = n === 1 ? '1 person' : `${n} people`;
        const ok = window.confirm(
          `Delete Pod ${pod.number}?` +
            (n ? ` Its ${people} will move to "Not in a pod yet".` : '') +
            ' This can’t be undone.'
        );
        if (!ok) return;
        const done = await send(`/api/org-chart/pods/${pod.id}`, 'DELETE');
        if (done) toast.success(`Deleted Pod ${pod.number}`);
      },

      createPod: async program => {
        const done = await send('/api/org-chart/pods', 'POST', { program });
        if (done) toast.success('Pod added. Click its focus to name it.');
      },

      addMember: async userId => {
        const done = await send('/api/org-chart/members', 'POST', {
          userId,
          podId: null,
        });
        if (done?.undo) offerUndo(done.undo);
        return !!done;
      },
    };
  }, [
    editing,
    viewer,
    roster,
    led,
    send,
    offerUndo,
    drag,
    baseContainers,
    byId,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Moving the dragged item into another container re-renders the lists
  // under the pointer; for a frame, keep the last target so the preview
  // doesn't flicker between containers.
  const lastOver = useRef<UniqueIdentifier | null>(null);
  const justMoved = useRef(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      justMoved.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [drag?.containers]);

  /**
   * Lead seats win when the pointer is over one. Otherwise find the list
   * under the pointer and the closest person in it, so the dragged item
   * slots in between people.
   */
  const collisionDetection: CollisionDetection = useCallback(args => {
    const pointer = pointerWithin(args);
    const hits = pointer.length ? pointer : rectIntersection(args);
    const zone = (id: UniqueIdentifier) =>
      args.droppableContainers.find(c => c.id === id)?.data.current as
        | ZoneData
        | undefined;

    const seat = hits.find(h => {
      const z = zone(h.id);
      return z?.type === 'container' && isSeatContainer(z.containerId);
    });
    if (seat) {
      lastOver.current = seat.id;
      return [seat];
    }

    const list = hits.find(h => zone(h.id)?.type === 'container') ?? hits[0];
    if (!list) {
      return justMoved.current && lastOver.current
        ? [{ id: lastOver.current }]
        : [];
    }
    const listId = zone(list.id)?.containerId;
    const people = args.droppableContainers.filter(c => {
      const z = c.data.current as ZoneData | undefined;
      return z?.type === 'item' && z.containerId === listId;
    });
    const [closest] = people.length
      ? closestCenter({ ...args, droppableContainers: people })
      : [];
    lastOver.current = (closest ?? list).id;
    return [closest ?? list];
  }, []);

  const onDragStart = (e: DragStartEvent) => {
    const member = (e.active.data.current as ZoneData | undefined)?.member;
    const origin = findContainer(baseContainers, e.active.id);
    if (!member || !origin) return;
    setDrag({
      member,
      origin,
      originIndex: baseContainers[origin].indexOf(member.id),
      containers: baseContainers,
    });
  };

  /** Preview the drop: put the dragged person where they'd land. */
  const onDragOver = ({ active, over }: DragOverEvent) => {
    const overZone = over?.data.current as ZoneData | undefined;
    setDrag(d => {
      if (!d || !over || !overZone) return d;
      const id = String(active.id);
      const current = findContainer(d.containers, id);
      const to = overZone.containerId;
      const valid =
        to === d.origin || api.allows(d.member, containerTarget(to));

      // Not allowed here: show them back where they started.
      if (!valid) {
        if (current === d.origin) return d;
        justMoved.current = true;
        return {
          ...d,
          containers: placeIn(d.containers, id, d.origin, d.originIndex),
        };
      }
      // Within a list the sortable strategy shifts people visually.
      if (current === to) return d;

      const list = d.containers[to] ?? [];
      let index = list.length;
      if (isSeatContainer(to)) index = 0;
      else if (overZone.type === 'item') {
        const at = list.indexOf(String(over.id));
        if (at >= 0) index = at + (isAfter(active, over.rect) ? 1 : 0);
      }
      justMoved.current = true;
      return { ...d, containers: placeIn(d.containers, id, to, index) };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const d = drag;
    setDrag(null);
    if (!d || !over) return;

    const id = String(active.id);
    const to = findContainer(d.containers, id);
    if (!to) return;
    let list = d.containers[to];
    // A move within the list the sortable strategy has been previewing.
    const overZone = over.data.current as ZoneData | undefined;
    if (
      overZone?.type === 'item' &&
      overZone.containerId === to &&
      !isSeatContainer(to)
    ) {
      list = arrayMove(list, list.indexOf(id), list.indexOf(String(over.id)));
    }
    const index = list.indexOf(id);
    if (to === d.origin && index === d.originIndex) return;

    const target = containerTarget(to);
    if (!api.allows(d.member, target)) return;
    void api.move(d.member, target, {
      index: isSeatContainer(to) ? undefined : index,
    });
  };

  const unassigned = (drag?.containers ?? baseContainers)[UNASSIGNED].flatMap(
    id => byId.get(id) ?? []
  );
  const showUnassigned = unassigned.length > 0 || editing;

  return (
    <BoardProvider value={api}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDrag(null)}
      >
        {canEdit &&
          (editing ? (
            <div className="hidden items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 lg:flex">
              <p className="text-sm text-gray-600">
                <EditHint viewer={viewer} led={led} pods={roster.pods} />
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {viewer.isAdmin && (
                  <>
                    <AddPersonDialog />
                    <ChangeLogDialog />
                  </>
                )}
                <Button
                  size="sm"
                  variant="navy"
                  onClick={() => setEditing(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <p className="text-xs text-gray-500 lg:hidden">
                Widen the window to edit the org chart.
              </p>
              <Button
                className="hidden lg:inline-flex"
                size="sm"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit org chart
              </Button>
            </div>
          ))}

        <div className="grid grid-cols-1 gap-10 pt-6 xl:grid-cols-2 xl:gap-8">
          {PROGRAMS.map(program => {
            const pods = roster.pods.filter(p => p.program === program);
            return (
              <section key={program} aria-label={PROGRAM_HEADINGS[program]}>
                <SectionHeader
                  title={PROGRAM_HEADINGS[program]}
                  detail={programDetails[program]}
                />
                {pods.length === 0 ? (
                  <p className="text-center text-sm text-gray-400">
                    No pods yet
                  </p>
                ) : (
                  <PodStacks pods={pods} />
                )}
                {editing && viewer.isAdmin && (
                  <button
                    type="button"
                    onClick={() => void api.createPod(program)}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Plus className="h-4 w-4" />
                    Add {program === 'value' ? 'Value' : 'Systematic'} pod
                  </button>
                )}
              </section>
            );
          })}
        </div>

        {showUnassigned && (
          <section aria-label="Not in a pod yet">
            <SectionHeader
              title="Not in a pod yet"
              detail={`${unassigned.length} ${unassigned.length === 1 ? 'person' : 'people'}`}
            />
            <Zone
              id={UNASSIGNED}
              strategy={rectSortingStrategy}
              // Leaders can drop people here but only admins reorder it.
              sortable={viewer.isAdmin}
              className={editing ? 'min-h-[3rem] p-2' : undefined}
            >
              {unassigned.length === 0 ? (
                <p className="text-sm italic text-gray-400">
                  Drag people here to take them out of a pod
                </p>
              ) : (
                <ul className="grid grid-cols-4 gap-x-6 gap-y-1 2xl:grid-cols-5">
                  {unassigned.map(m => (
                    <li key={m.id} className="min-w-0">
                      <MemberChip member={m} containerId={UNASSIGNED}>
                        <PersonName person={m.person} />
                      </MemberChip>
                    </li>
                  ))}
                </ul>
              )}
            </Zone>
          </section>
        )}

        <DragOverlay dropAnimation={null}>
          {drag && (
            <div className="cursor-grabbing rounded-md border border-gray-200 bg-white px-2.5 py-1 shadow-lg">
              <PersonName person={drag.member.person} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </BoardProvider>
  );
}
