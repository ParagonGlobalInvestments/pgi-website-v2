import {
  emptyDraft,
  experienceEditorReducer as reduce,
  initialExperienceEditorState as initial,
  type ExperienceDraft,
  type ExperienceEditorState,
} from './experienceEditor';

const draft: ExperienceDraft = {
  company: 'Acme',
  role: 'Analyst',
  startYear: '2024',
  endYear: '',
};

const editing = (id = 'a'): ExperienceEditorState =>
  reduce(initial, { type: 'START_EDIT', id, draft });

const list = (state: ExperienceEditorState): ExperienceEditorState => ({
  ...state,
  mode: { kind: 'list' },
  pending: { kind: 'idle' },
});

describe('experienceEditorReducer', () => {
  it('opens an empty add form from the list', () => {
    expect(reduce(initial, { type: 'START_ADD' }).mode).toEqual({
      kind: 'adding',
      formId: 1,
      draft: emptyDraft,
    });
  });

  it('ignores START_ADD while a form is open', () => {
    const state = editing();
    expect(reduce(state, { type: 'START_ADD' })).toBe(state);
  });

  it('replaces the add form when editing starts', () => {
    const adding = reduce(initial, { type: 'START_ADD' });
    const next = reduce(adding, { type: 'START_EDIT', id: 'a', draft });
    expect(next.mode).toEqual({ kind: 'editing', formId: 2, id: 'a', draft });
  });

  it('updates the open draft and ignores updates in list mode', () => {
    const changed = { ...draft, role: 'PM' };
    expect(
      reduce(editing(), { type: 'UPDATE_DRAFT', draft: changed }).mode
    ).toMatchObject({ kind: 'editing', id: 'a', draft: changed });
    expect(reduce(initial, { type: 'UPDATE_DRAFT', draft: changed })).toBe(
      initial
    );
  });

  it('only starts saving a valid draft when idle', () => {
    const adding = reduce(initial, { type: 'START_ADD' });
    const invalid = reduce(adding, {
      type: 'UPDATE_DRAFT',
      draft: { ...draft, company: ' ' },
    });
    expect(reduce(invalid, { type: 'SAVE_START' })).toBe(invalid);
    expect(reduce(initial, { type: 'SAVE_START' })).toBe(initial);
    expect(reduce(editing(), { type: 'SAVE_START' }).pending).toEqual({
      kind: 'saving',
      formId: 1,
    });
  });

  it('returns to the list on save success and keeps the form on failure', () => {
    const open = editing();
    const saving = reduce(open, { type: 'SAVE_START' });
    expect(reduce(saving, { type: 'SAVE_SUCCESS' })).toEqual(list(open));
    expect(reduce(saving, { type: 'SAVE_FAILURE' })).toEqual(open);
  });

  it('a late save response does not close a form opened after it', () => {
    let s = reduce(editing(), { type: 'SAVE_START' });
    s = reduce(s, { type: 'CANCEL' });
    s = reduce(s, { type: 'START_ADD' });
    s = reduce(s, {
      type: 'UPDATE_DRAFT',
      draft: { ...draft, company: 'New' },
    });
    s = reduce(s, { type: 'SAVE_SUCCESS' });
    expect(s.pending).toEqual({ kind: 'idle' });
    expect(s.mode).toMatchObject({
      kind: 'adding',
      draft: { company: 'New' },
    });
  });

  it('a late save response does not close another row opened mid-save', () => {
    let s = reduce(editing('a'), { type: 'SAVE_START' });
    s = reduce(s, { type: 'START_EDIT', id: 'b', draft });
    s = reduce(s, { type: 'SAVE_SUCCESS' });
    expect(s.mode).toMatchObject({ kind: 'editing', id: 'b' });
  });

  it('allows one delete at a time and none while saving', () => {
    const deleting = reduce(initial, { type: 'DELETE_START', id: 'a' });
    expect(deleting.pending).toEqual({ kind: 'deleting', id: 'a' });
    expect(reduce(deleting, { type: 'DELETE_START', id: 'b' })).toBe(deleting);
    const saving = reduce(editing(), { type: 'SAVE_START' });
    expect(reduce(saving, { type: 'DELETE_START', id: 'b' })).toBe(saving);
  });

  it('does not start a save while a delete is in flight', () => {
    const s = reduce(editing('a'), { type: 'DELETE_START', id: 'b' });
    expect(reduce(s, { type: 'SAVE_START' })).toBe(s);
  });

  it('closes the edit form when its entry is deleted', () => {
    const open = editing('a');
    const s = reduce(open, { type: 'DELETE_START', id: 'a' });
    expect(reduce(s, { type: 'DELETE_SUCCESS', id: 'a' })).toEqual(list(open));
  });

  it('keeps another open form when a different entry is deleted', () => {
    const open = editing('a');
    const s = reduce(open, { type: 'DELETE_START', id: 'b' });
    expect(reduce(s, { type: 'DELETE_SUCCESS', id: 'b' })).toEqual(open);
    expect(reduce(s, { type: 'DELETE_FAILURE' })).toEqual(open);
  });
});
