/**
 * Experience editor state machine (settings page).
 *
 * Two independent axes:
 * - `mode`: what the editor shows. Adding and editing are separate variants,
 *   so both can't be active at once.
 * - `pending`: the request in flight. Only one runs at a time.
 *
 * Every opened form gets a fresh `formId`. A save remembers the form it came
 * from, so a late response only closes that form — never one opened after it.
 */

export interface ExperienceDraft {
  company: string;
  role: string;
  startYear: string;
  endYear: string;
}

export const emptyDraft: ExperienceDraft = {
  company: '',
  role: '',
  startYear: '',
  endYear: '',
};

export type ExperienceEditorMode =
  | { kind: 'list' }
  | { kind: 'adding'; formId: number; draft: ExperienceDraft }
  | { kind: 'editing'; formId: number; id: string; draft: ExperienceDraft };

export type ExperiencePendingOp =
  | { kind: 'idle' }
  | { kind: 'saving'; formId: number }
  | { kind: 'deleting'; id: string };

export interface ExperienceEditorState {
  mode: ExperienceEditorMode;
  pending: ExperiencePendingOp;
  /** Last issued formId */
  formSeq: number;
}

export type ExperienceEditorEvent =
  | { type: 'START_ADD' }
  | { type: 'START_EDIT'; id: string; draft: ExperienceDraft }
  | { type: 'UPDATE_DRAFT'; draft: ExperienceDraft }
  | { type: 'CANCEL' }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_FAILURE' }
  | { type: 'DELETE_START'; id: string }
  | { type: 'DELETE_SUCCESS'; id: string }
  | { type: 'DELETE_FAILURE' };

export const initialExperienceEditorState: ExperienceEditorState = {
  mode: { kind: 'list' },
  pending: { kind: 'idle' },
  formSeq: 0,
};

export function isDraftValid(draft: ExperienceDraft): boolean {
  return Boolean(draft.company.trim() && draft.role.trim());
}

export function experienceEditorReducer(
  state: ExperienceEditorState,
  event: ExperienceEditorEvent
): ExperienceEditorState {
  const { mode, pending, formSeq } = state;

  switch (event.type) {
    case 'START_ADD':
      if (mode.kind !== 'list') return state;
      return {
        ...state,
        mode: { kind: 'adding', formId: formSeq + 1, draft: emptyDraft },
        formSeq: formSeq + 1,
      };

    case 'START_EDIT':
      return {
        ...state,
        mode: {
          kind: 'editing',
          formId: formSeq + 1,
          id: event.id,
          draft: event.draft,
        },
        formSeq: formSeq + 1,
      };

    case 'UPDATE_DRAFT':
      if (mode.kind === 'list') return state;
      return { ...state, mode: { ...mode, draft: event.draft } };

    case 'CANCEL':
      if (mode.kind === 'list') return state;
      return { ...state, mode: { kind: 'list' } };

    case 'SAVE_START':
      if (mode.kind === 'list' || pending.kind !== 'idle') return state;
      if (!isDraftValid(mode.draft)) return state;
      return { ...state, pending: { kind: 'saving', formId: mode.formId } };

    case 'SAVE_SUCCESS': {
      if (pending.kind !== 'saving') return state;
      const savedFormOpen =
        mode.kind !== 'list' && mode.formId === pending.formId;
      return {
        ...state,
        mode: savedFormOpen ? { kind: 'list' } : mode,
        pending: { kind: 'idle' },
      };
    }

    case 'SAVE_FAILURE':
      if (pending.kind !== 'saving') return state;
      return { ...state, pending: { kind: 'idle' } };

    case 'DELETE_START':
      if (pending.kind !== 'idle') return state;
      return { ...state, pending: { kind: 'deleting', id: event.id } };

    case 'DELETE_SUCCESS': {
      if (pending.kind !== 'deleting' || pending.id !== event.id) return state;
      const closesForm = mode.kind === 'editing' && mode.id === event.id;
      return {
        ...state,
        mode: closesForm ? { kind: 'list' } : mode,
        pending: { kind: 'idle' },
      };
    }

    case 'DELETE_FAILURE':
      if (pending.kind !== 'deleting') return state;
      return { ...state, pending: { kind: 'idle' } };

    default:
      return state;
  }
}
