/**
 * Selection shown in a slide-over detail panel. A closed panel keeps its last
 * item so the exit animation still has content to render; `empty` means
 * nothing has been opened yet.
 */
export type PanelState<T> =
  | { status: 'empty' }
  | { status: 'open'; item: T }
  | { status: 'closed'; item: T };

export const EMPTY_PANEL: PanelState<never> = { status: 'empty' };

export function openPanel<T>(item: T): PanelState<T> {
  return { status: 'open', item };
}

export function closePanel<T>(state: PanelState<T>): PanelState<T> {
  return state.status === 'open'
    ? { status: 'closed', item: state.item }
    : state;
}

/** The item to render (including during the close animation), if any. */
export function panelItem<T>(state: PanelState<T>): T | null {
  return state.status === 'empty' ? null : state.item;
}
