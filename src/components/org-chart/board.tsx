'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { MoveTarget } from '@/lib/org-chart-rules';
import type {
  OrgChartViewer,
  Pod,
  PodMember,
  PodRoster,
  UserProgram,
} from '@/types';
import { cn } from '@/utils';

/** What the pod board offers its cards while editing. */
export interface BoardApi {
  editing: boolean;
  viewer: OrgChartViewer;
  roster: PodRoster;
  canDrag(member: PodMember): boolean;
  allows(member: PodMember, target: MoveTarget): boolean;
  move(
    member: PodMember,
    target: MoveTarget,
    opts?: { copy?: boolean }
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

/**
 * False inside <StaticCopy>. dnd-kit keeps one registry entry per id, so a
 * second rendering of the same people (the phone layout, which the board
 * renders alongside the desktop one when not editing) must not register
 * draggables or drop targets: unmounting it would remove the entries the
 * visible desktop layout depends on, and dragging would stop working.
 */
const InteractiveContext = createContext(true);

/** Render children without drag-and-drop (see InteractiveContext). */
export function StaticCopy({ children }: { children: ReactNode }) {
  return (
    <InteractiveContext.Provider value={false}>
      {children}
    </InteractiveContext.Provider>
  );
}

/** The placement being dragged, if any. */
export function useDraggedMember(): PodMember | null {
  const { active } = useDndContext();
  return (active?.data.current?.member as PodMember | undefined) ?? null;
}

interface DropZoneProps {
  id: string;
  target: MoveTarget;
  className?: string;
  children: ReactNode;
}

/** A drop target that moves the dropped placement to `target`. */
export function DropZone(props: DropZoneProps) {
  if (useContext(InteractiveContext)) return <ActiveDropZone {...props} />;
  return (
    <div className={cn('rounded-lg', props.className)}>{props.children}</div>
  );
}

function ActiveDropZone({ id, target, className, children }: DropZoneProps) {
  const board = useBoard();
  const dragged = useDraggedMember();
  const allowed = !!dragged && board.allows(dragged, target);
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { target },
    disabled: !board.editing,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg transition-colors',
        allowed && 'outline-dashed outline-1 outline-offset-2 outline-navy/30',
        allowed && isOver && 'bg-blue-50 outline-2 outline-navy/60',
        className
      )}
    >
      {children}
    </div>
  );
}

interface MemberChipProps {
  member: PodMember;
  className?: string;
  children: ReactNode;
}

/** A placement that can be picked up when the viewer may move it. */
export function MemberChip(props: MemberChipProps) {
  if (useContext(InteractiveContext)) return <ActiveMemberChip {...props} />;
  return <div className={props.className}>{props.children}</div>;
}

function ActiveMemberChip({ member, className, children }: MemberChipProps) {
  const board = useBoard();
  const draggable = board.editing && board.canDrag(member);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: member.id,
    data: { member },
    disabled: !draggable,
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
      {...(draggable ? { ...attributes, ...listeners } : {})}
      aria-roledescription={draggable ? 'draggable person' : undefined}
      title={locked ? lockedReason : undefined}
      className={cn(
        board.editing && 'select-none',
        locked && 'cursor-not-allowed opacity-60',
        draggable &&
          '-mx-1.5 cursor-grab touch-none rounded-md px-1.5 py-0.5 ring-1 ring-transparent hover:bg-gray-50 hover:ring-gray-200 focus-visible:outline-none focus-visible:ring-navy/50 active:cursor-grabbing',
        isDragging && 'opacity-30',
        className
      )}
    >
      {children}
    </div>
  );
}
