'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  type SortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MoveTarget } from '@/lib/org-chart-rules';
import type {
  OrgChartViewer,
  Pod,
  PodMember,
  PodRoster,
  PodSeat,
  UserProgram,
} from '@/types';
import { cn } from '@/utils';

// ============================================================================
// Containers
//
// Every place a person can be is a container: each pod's lead seats, each
// pod's analyst list, and "Not in a pod yet". While dragging, the board keeps
// a preview of which people are in which container, in order, so the dragged
// person shows as an empty box where they'd land and everyone else shifts.
// ============================================================================

export const UNASSIGNED = 'unassigned';

export function containerId(podId: string | null, seat: PodSeat): string {
  return podId ? `${podId}:${seat}` : UNASSIGNED;
}

export function containerTarget(id: string): MoveTarget {
  if (id === UNASSIGNED) return { podId: null, seat: 'analyst' };
  const [podId, seat] = id.split(':');
  return { podId, seat: seat as PodSeat };
}

/** Lead seats hold one person; lists are ordered. */
export function isSeatContainer(id: string): boolean {
  return id !== UNASSIGNED && !id.endsWith(':analyst');
}

/** Data attached to drop targets, read by the board's collision detection. */
export interface ZoneData {
  type: 'container' | 'item';
  containerId: string;
  member?: PodMember;
}

// ============================================================================
// Board context
// ============================================================================

/** What the pod board offers its cards. */
export interface BoardApi {
  editing: boolean;
  viewer: OrgChartViewer;
  roster: PodRoster;
  /** The person being dragged, if any. */
  dragging: PodMember | null;
  /** Who is in a container right now (the drag preview while dragging). */
  items(containerId: string): PodMember[];
  canDrag(member: PodMember): boolean;
  allows(member: PodMember, target: MoveTarget): boolean;
  move(
    member: PodMember,
    target: MoveTarget,
    opts?: { copy?: boolean; index?: number }
  ): Promise<void>;
  updateFocus(pod: Pod, focus: string): Promise<boolean>;
  deletePod(pod: Pod): Promise<void>;
  createPod(program: UserProgram): Promise<void>;
  addMember(userId: string): Promise<boolean>;
}

const BoardContext = createContext<BoardApi | null>(null);
export const BoardProvider = BoardContext.Provider;

export function useBoard(): BoardApi {
  const board = useContext(BoardContext);
  if (!board) throw new Error('useBoard must be used inside the pod board');
  return board;
}

// ============================================================================
// Components
// ============================================================================

/** Lead seats don't shift their contents. */
const noShift: SortingStrategy = () => null;

/**
 * A container's drop area. Valid drop areas get a dashed outline while
 * dragging; the one the dragged person would land in is filled.
 */
export function Zone({
  id,
  strategy,
  sortable = true,
  className,
  children,
}: {
  id: string;
  strategy?: SortingStrategy;
  /** False: people dropped here go to the end, with no reordering. */
  sortable?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const board = useBoard();
  const ids = board.items(id).map(m => m.id);
  const { setNodeRef } = useDroppable({
    id,
    data: { type: 'container', containerId: id } satisfies ZoneData,
    disabled: !board.editing,
  });

  const dragging = board.dragging;
  const allowed = !!dragging && board.allows(dragging, containerTarget(id));
  const landing = allowed && ids.includes(dragging.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg transition-colors',
        allowed && 'outline-dashed outline-1 outline-offset-2 outline-navy/30',
        landing && 'bg-blue-50/60 outline-navy/60',
        className
      )}
    >
      <SortableContext
        id={id}
        items={ids}
        strategy={isSeatContainer(id) ? noShift : strategy}
        // Items here are drop targets (for positions) only when sortable.
        disabled={{ draggable: false, droppable: !sortable || !board.editing }}
      >
        {children}
      </SortableContext>
    </div>
  );
}

/**
 * A person in a container. The dragged person renders as an empty dashed box
 * of the same size, wherever the preview puts them.
 */
export function MemberChip({
  member,
  containerId: inContainer,
  className,
  children,
}: {
  member: PodMember;
  containerId: string;
  className?: string;
  children: ReactNode;
}) {
  const board = useBoard();
  const draggable = board.editing && board.canDrag(member);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: member.id,
    data: {
      type: 'item',
      containerId: inContainer,
      member,
    } satisfies ZoneData,
    // Whether this item is a drop target comes from its Zone.
    disabled: { draggable: !draggable },
  });

  // In edit mode, say why a name can't be picked up instead of letting the
  // drag attempt turn into a text selection.
  const locked = board.editing && !draggable;
  const lockedReason =
    member.podId && member.seat !== 'analyst'
      ? 'Only admins can move pod leads'
      : 'You can only move people in your own pod';

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      aria-roledescription={draggable ? 'draggable person' : undefined}
      title={locked ? lockedReason : undefined}
      className={cn(
        board.editing && 'select-none',
        locked && !isDragging && 'cursor-not-allowed opacity-60',
        draggable &&
          '-mx-1.5 cursor-grab touch-none rounded-md px-1.5 py-0.5 ring-1 ring-transparent hover:bg-gray-50 hover:ring-gray-200 focus-visible:outline-none focus-visible:ring-navy/50 active:cursor-grabbing',
        isDragging &&
          'rounded-md bg-white outline-dashed outline-1 outline-navy/50 hover:bg-white',
        className
      )}
    >
      <div className={cn(isDragging && 'invisible')}>{children}</div>
    </div>
  );
}
