'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { UndoSnapshot } from '@/lib/org-chart-edit';
import {
  canMove,
  ledPodIds,
  moveLocally,
  podHasSeat,
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
  DropZone,
  MemberChip,
  StaticCopy,
  type BoardApi,
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

// Pointer position for mouse drags; rectangles for keyboard drags.
const collisionDetection: CollisionDetection = args => {
  const hits = pointerWithin(args);
  return hits.length ? hits : rectIntersection(args);
};

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
 * down the card beside it. Small screens get one stack in order. Editing
 * (desktop only) renders just the two stacks, so each drop target exists once.
 */
function PodStacks({ pods, editing }: { pods: Pod[]; editing: boolean }) {
  const stacks = [0, 1].map(col => pods.filter((_, i) => i % 2 === col));
  return (
    <>
      {!editing && (
        <StaticCopy>
          <div className="flex flex-col gap-4 sm:hidden">
            {pods.map(pod => (
              <PodCard key={pod.id} pod={pod} />
            ))}
          </div>
        </StaticCopy>
      )}
      <div
        className={
          editing
            ? 'grid grid-cols-2 gap-4'
            : 'hidden grid-cols-2 gap-4 sm:grid'
        }
      >
        {stacks.map((stack, col) => (
          <div key={col} className="flex flex-col gap-4">
            {stack.map(pod => (
              <PodCard key={pod.id} pod={pod} />
            ))}
          </div>
        ))}
      </div>
    </>
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
        Drag people between pods, onto a seat, or out to &ldquo;Not in a pod
        yet&rdquo;. Changes save as soon as you drop.
      </>
    );
  }
  const names = pods
    .filter(p => led.has(p.id))
    .map(p => `Pod ${p.number}`)
    .join(', ');
  return (
    <>
      You can move analysts between {names} and &ldquo;Not in a pod yet&rdquo;.
      Changes save as soon as you drop.
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
  const [dragged, setDragged] = useState<PodMember | null>(null);
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

  const api: BoardApi = useMemo(() => {
    const allows = (member: PodMember, target: MoveTarget) => {
      const pod = roster.pods.find(p => p.id === target.podId);
      if (target.podId && (!pod || !podHasSeat(pod.program, target.seat))) {
        return false;
      }
      const unchanged =
        member.podId === target.podId &&
        (target.podId === null || member.seat === target.seat);
      return !unchanged && canMove(viewer, led, member, target);
    };

    return {
      editing,
      viewer,
      roster,
      allows,
      canDrag: member =>
        viewer.isAdmin ||
        (led.size > 0 &&
          (member.podId === null ||
            (led.has(member.podId) && member.seat === 'analyst'))),

      move: async (member, target, opts = {}) => {
        if (!opts.copy) {
          if (!allows(member, target)) return;
          setRoster(r => moveLocally(r, member.id, target));
        }
        const done = await send('/api/org-chart/members/move', 'POST', {
          memberId: member.id,
          podId: target.podId,
          seat: target.seat,
          copy: opts.copy ?? false,
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
  }, [editing, viewer, roster, led, send, offerUndo]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const onDragStart = (e: DragStartEvent) =>
    setDragged((e.active.data.current?.member as PodMember) ?? null);

  const onDragEnd = (e: DragEndEvent) => {
    setDragged(null);
    const member = e.active.data.current?.member as PodMember | undefined;
    const target = e.over?.data.current?.target as MoveTarget | undefined;
    if (member && target) void api.move(member, target);
  };

  const showUnassigned = roster.unassigned.length > 0 || editing;

  return (
    <BoardProvider value={api}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setDragged(null)}
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
                  <PodStacks pods={pods} editing={editing} />
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
              detail={`${roster.unassigned.length} ${roster.unassigned.length === 1 ? 'person' : 'people'}`}
            />
            <DropZone
              id="unassigned"
              target={{ podId: null, seat: 'analyst' }}
              className={editing ? 'min-h-[3rem] p-2' : undefined}
            >
              {roster.unassigned.length === 0 ? (
                <p className="text-sm italic text-gray-400">
                  Drag people here to take them out of a pod
                </p>
              ) : (
                <ul className="flex flex-wrap gap-x-6 gap-y-1">
                  {roster.unassigned.map(m => (
                    <li key={m.id}>
                      <MemberChip member={m}>
                        <PersonName person={m.person} />
                      </MemberChip>
                    </li>
                  ))}
                </ul>
              )}
            </DropZone>
          </section>
        )}

        <DragOverlay dropAnimation={null}>
          {dragged && (
            <div className="cursor-grabbing rounded-md border border-gray-200 bg-white px-2.5 py-1 shadow-lg">
              <PersonName person={dragged.person} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </BoardProvider>
  );
}
