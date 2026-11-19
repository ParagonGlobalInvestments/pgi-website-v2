/**
 * Settings profile autosave state machine.
 *
 * Each field tracks its own lifecycle, so saving one field never blocks or
 * overwrites another:
 *
 *   clean ──edit──▶ dirty ──blur──▶ saving ──ok──▶ clean (or dirty if edited meanwhile)
 *     ▲                                  └──fail─▶ error (value reverted)
 *     └──────────── edit back to the server value ────────────┘
 *
 * Server snapshots (initial load, revalidation, save responses) update
 * `serverValue` everywhere but never discard an unsaved edit.
 */

export const PROFILE_FIELDS = [
  'name',
  'linkedin',
  'github',
  'website',
] as const;
export type ProfileField = (typeof PROFILE_FIELDS)[number];
export type ProfileValues = Record<ProfileField, string>;

export type FieldState =
  | { status: 'clean'; value: string; serverValue: string }
  | { status: 'dirty'; value: string; serverValue: string }
  | {
      status: 'saving';
      value: string;
      serverValue: string;
      /** Value sent in the in-flight request */
      savingValue: string;
      /** Identifies the in-flight request so stale responses are ignored */
      requestId: number;
    }
  | { status: 'error'; value: string; serverValue: string; message: string };

export type ProfileFields = Record<ProfileField, FieldState>;

export type ProfileFormState =
  | { status: 'unloaded' }
  | {
      status: 'loaded';
      fields: ProfileFields;
      /** Newest save whose server snapshot has been applied */
      appliedRequestId: number;
    };

export type ProfileFormEvent =
  | { type: 'LOAD'; values: ProfileValues }
  | { type: 'EDIT'; field: ProfileField; value: string }
  | { type: 'REJECT'; field: ProfileField; message: string }
  | {
      type: 'SAVE_START';
      field: ProfileField;
      value: string;
      requestId: number;
    }
  | {
      type: 'SAVE_SUCCESS';
      field: ProfileField;
      requestId: number;
      values: ProfileValues;
    }
  | {
      type: 'SAVE_FAILURE';
      field: ProfileField;
      requestId: number;
      message: string;
    };

function clean(value: string): FieldState {
  return { status: 'clean', value, serverValue: value };
}

function edited(value: string, serverValue: string): FieldState {
  return value === serverValue
    ? clean(value)
    : { status: 'dirty', value, serverValue };
}

/** Apply a fresh server value without discarding unsaved edits. */
function withServerValue(field: FieldState, serverValue: string): FieldState {
  switch (field.status) {
    case 'clean':
    case 'error':
      return clean(serverValue);
    case 'dirty':
      return edited(field.value, serverValue);
    case 'saving':
      return { ...field, serverValue };
  }
}

function mapFields(
  fields: ProfileFields,
  fn: (field: FieldState, key: ProfileField) => FieldState
): ProfileFields {
  return Object.fromEntries(
    PROFILE_FIELDS.map(key => [key, fn(fields[key], key)])
  ) as ProfileFields;
}

/**
 * Whether saving `field` would send a request. While a save is in flight the
 * comparison is against the value being saved, since that is what the server
 * will hold once it lands.
 */
export function shouldSave(field: FieldState): boolean {
  if (field.status === 'saving') return field.value !== field.savingValue;
  return field.value !== field.serverValue;
}

export function profileFormReducer(
  state: ProfileFormState,
  event: ProfileFormEvent
): ProfileFormState {
  if (event.type === 'LOAD') {
    if (state.status === 'unloaded') {
      return {
        status: 'loaded',
        fields: mapFields({} as ProfileFields, (_, key) =>
          clean(event.values[key])
        ),
        appliedRequestId: 0,
      };
    }
    return {
      ...state,
      fields: mapFields(state.fields, (field, key) =>
        withServerValue(field, event.values[key])
      ),
    };
  }

  if (state.status === 'unloaded') return state;
  const current = state.fields[event.field];
  const set = (next: FieldState): ProfileFormState => ({
    ...state,
    fields: { ...state.fields, [event.field]: next },
  });

  switch (event.type) {
    case 'EDIT':
      if (current.status === 'saving')
        return set({ ...current, value: event.value });
      return set(edited(event.value, current.serverValue));

    case 'REJECT':
      // Mid-save, fall back to the value about to be confirmed
      if (current.status === 'saving')
        return set({ ...current, value: current.savingValue });
      return set({
        status: 'error',
        value: current.serverValue,
        serverValue: current.serverValue,
        message: event.message,
      });

    case 'SAVE_START':
      return set({
        status: 'saving',
        value: current.value,
        serverValue: current.serverValue,
        savingValue: event.value,
        requestId: event.requestId,
      });

    case 'SAVE_SUCCESS': {
      // Responses can land out of order; an older snapshot must not
      // overwrite values a newer save already applied.
      const isNewest = event.requestId > state.appliedRequestId;
      return {
        ...state,
        appliedRequestId: Math.max(state.appliedRequestId, event.requestId),
        fields: mapFields(state.fields, (field, key) => {
          const serverValue = event.values[key];
          if (
            key === event.field &&
            field.status === 'saving' &&
            field.requestId === event.requestId
          ) {
            // The server may normalize (e.g. trim); adopt its value unless
            // the user kept typing after this save started.
            return field.value === field.savingValue
              ? clean(serverValue)
              : edited(field.value, serverValue);
          }
          return isNewest ? withServerValue(field, serverValue) : field;
        }),
      };
    }

    case 'SAVE_FAILURE':
      if (current.status !== 'saving' || current.requestId !== event.requestId)
        return state;
      // Revert to the last confirmed value
      return set({
        status: 'error',
        value: current.serverValue,
        serverValue: current.serverValue,
        message: event.message,
      });

    default:
      return state;
  }
}
