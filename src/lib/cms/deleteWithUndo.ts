import { toast } from 'sonner';

/**
 * Lifecycle of one optimistic delete:
 *
 *   pending ──undo──▶ undone
 *      │
 *    commit (5s timer, toast closed, or pagehide)
 *      ▼
 *   committing ──succeed──▶ committed
 *      └───────fail───────▶ failed (row restored)
 *
 * `undone`, `committed` and `failed` are terminal; events there are ignored.
 */
export type UndoDeleteStatus =
  | 'pending'
  | 'undone'
  | 'committing'
  | 'committed'
  | 'failed';

export type UndoDeleteEvent = 'undo' | 'commit' | 'succeed' | 'fail';

const TRANSITIONS: Record<
  UndoDeleteStatus,
  Partial<Record<UndoDeleteEvent, UndoDeleteStatus>>
> = {
  pending: { undo: 'undone', commit: 'committing' },
  committing: { succeed: 'committed', fail: 'failed' },
  undone: {},
  committed: {},
  failed: {},
};

/** The next status, or null when the event doesn't apply in this status. */
export function nextUndoDeleteStatus(
  status: UndoDeleteStatus,
  event: UndoDeleteEvent
): UndoDeleteStatus | null {
  return TRANSITIONS[status][event] ?? null;
}

const UNDO_WINDOW_MS = 5000;

export function deleteWithUndo(
  url: string,
  displayName: string,
  restore: () => void
) {
  let status: UndoDeleteStatus = 'pending';

  /** Apply an event; returns false if it was ignored. */
  const send = (event: UndoDeleteEvent): boolean => {
    const next = nextUndoDeleteStatus(status, event);
    if (!next) return false;
    status = next;
    return true;
  };

  const stopListening = () => {
    window.clearTimeout(timer);
    window.removeEventListener('pagehide', commitDelete);
  };

  const commitDelete = async () => {
    if (!send('commit')) return;
    stopListening();
    toast.dismiss(toastId);

    try {
      // Let the request finish even when a refresh closes the Undo window.
      const res = await fetch(url, { method: 'DELETE', keepalive: true });
      if (!res.ok) throw new Error('Failed to delete');
      send('succeed');
    } catch {
      send('fail');
      toast.error('Failed to delete — restoring');
      restore();
    }
  };

  const undoDelete = () => {
    if (!send('undo')) return;
    stopListening();
    restore();
  };

  const timer = window.setTimeout(commitDelete, UNDO_WINDOW_MS);
  window.addEventListener('pagehide', commitDelete);

  const toastId = toast(`Deleted "${displayName}"`, {
    action: { label: 'Undo', onClick: undoDelete },
    duration: UNDO_WINDOW_MS,
    onAutoClose: commitDelete,
    onDismiss: commitDelete,
  });
}
