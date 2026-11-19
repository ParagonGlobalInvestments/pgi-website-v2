import {
  profileFormReducer as reduce,
  shouldSave,
  type ProfileFormState,
  type ProfileValues,
} from './profileAutosave';

const server: ProfileValues = {
  name: 'Ada',
  linkedin: 'ada',
  github: 'ada-gh',
  website: '',
};

const loaded = (): ProfileFormState =>
  reduce({ status: 'unloaded' }, { type: 'LOAD', values: server });

const fieldsOf = (state: ProfileFormState) => {
  if (state.status !== 'loaded') throw new Error('not loaded');
  return state.fields;
};

describe('profileFormReducer', () => {
  it('seeds every field as clean on first load', () => {
    expect(fieldsOf(loaded()).name).toEqual({
      status: 'clean',
      value: 'Ada',
      serverValue: 'Ada',
    });
  });

  it('ignores field events before load', () => {
    const unloaded: ProfileFormState = { status: 'unloaded' };
    expect(reduce(unloaded, { type: 'EDIT', field: 'name', value: 'x' })).toBe(
      unloaded
    );
  });

  it('marks edits dirty and editing back to the server value clean', () => {
    const dirty = reduce(loaded(), { type: 'EDIT', field: 'name', value: 'A' });
    expect(fieldsOf(dirty).name.status).toBe('dirty');
    const back = reduce(dirty, { type: 'EDIT', field: 'name', value: 'Ada' });
    expect(fieldsOf(back).name.status).toBe('clean');
  });

  it('saves two fields concurrently without clobbering', () => {
    let s = loaded();
    s = reduce(s, { type: 'EDIT', field: 'name', value: 'Ava' });
    s = reduce(s, {
      type: 'SAVE_START',
      field: 'name',
      value: 'Ava',
      requestId: 1,
    });
    s = reduce(s, { type: 'EDIT', field: 'github', value: 'new' });
    s = reduce(s, {
      type: 'SAVE_START',
      field: 'github',
      value: 'new',
      requestId: 2,
    });

    // name's response predates github's save
    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'name',
      requestId: 1,
      values: { ...server, name: 'Ava' },
    });
    expect(fieldsOf(s).name.status).toBe('clean');
    expect(fieldsOf(s).github).toMatchObject({
      status: 'saving',
      value: 'new',
    });

    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'github',
      requestId: 2,
      values: { ...server, name: 'Ava', github: 'new' },
    });
    expect(fieldsOf(s).github).toEqual({
      status: 'clean',
      value: 'new',
      serverValue: 'new',
    });
    expect(fieldsOf(s).name.value).toBe('Ava');
  });

  it('keeps edits made while saving, leaving the field dirty', () => {
    let s = loaded();
    s = reduce(s, {
      type: 'SAVE_START',
      field: 'name',
      value: 'Ava',
      requestId: 1,
    });
    s = reduce(s, { type: 'EDIT', field: 'name', value: 'Ava L' });
    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'name',
      requestId: 1,
      values: { ...server, name: 'Ava' },
    });
    expect(fieldsOf(s).name).toEqual({
      status: 'dirty',
      value: 'Ava L',
      serverValue: 'Ava',
    });
  });

  it('reverts to the server value on failure and ignores stale failures', () => {
    let s = loaded();
    s = reduce(s, { type: 'EDIT', field: 'website', value: 'bad' });
    s = reduce(s, {
      type: 'SAVE_START',
      field: 'website',
      value: 'bad',
      requestId: 1,
    });
    s = reduce(s, {
      type: 'SAVE_START',
      field: 'website',
      value: 'bad2',
      requestId: 2,
    });
    const stale = reduce(s, {
      type: 'SAVE_FAILURE',
      field: 'website',
      requestId: 1,
      message: 'nope',
    });
    expect(stale).toBe(s);
    s = reduce(s, {
      type: 'SAVE_FAILURE',
      field: 'website',
      requestId: 2,
      message: 'nope',
    });
    expect(fieldsOf(s).website).toEqual({
      status: 'error',
      value: '',
      serverValue: '',
      message: 'nope',
    });
  });

  it('REJECT reverts the value to the server value', () => {
    let s = reduce(loaded(), { type: 'EDIT', field: 'name', value: '' });
    s = reduce(s, { type: 'REJECT', field: 'name', message: 'empty' });
    expect(fieldsOf(s).name).toMatchObject({ status: 'error', value: 'Ada' });
  });

  it('server snapshots keep unsaved edits', () => {
    let s = reduce(loaded(), {
      type: 'EDIT',
      field: 'linkedin',
      value: 'typing',
    });
    s = reduce(s, { type: 'LOAD', values: { ...server, name: 'Server Name' } });
    expect(fieldsOf(s).linkedin).toEqual({
      status: 'dirty',
      value: 'typing',
      serverValue: 'ada',
    });
    expect(fieldsOf(s).name).toEqual({
      status: 'clean',
      value: 'Server Name',
      serverValue: 'Server Name',
    });
  });
});

describe('profileFormReducer review fixes', () => {
  const start = (
    s: ProfileFormState,
    field: 'name' | 'linkedin' | 'github' | 'website',
    value: string,
    requestId: number
  ) =>
    reduce(reduce(s, { type: 'EDIT', field, value }), {
      type: 'SAVE_START',
      field,
      value,
      requestId,
    });

  it('adopts a server-normalized value instead of staying dirty', () => {
    let s = start(loaded(), 'name', 'Bobby ', 1);
    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'name',
      requestId: 1,
      values: { ...server, name: 'Bobby' },
    });
    expect(fieldsOf(s).name).toEqual({
      status: 'clean',
      value: 'Bobby',
      serverValue: 'Bobby',
    });
    expect(shouldSave(fieldsOf(s).name)).toBe(false);
  });

  it('saves a clear made while the previous value is still saving', () => {
    const empty = reduce(loaded(), {
      type: 'LOAD',
      values: { ...server, linkedin: '' },
    });
    let s = start(empty, 'linkedin', 'abc', 1);
    s = reduce(s, { type: 'EDIT', field: 'linkedin', value: '' });
    expect(shouldSave(fieldsOf(s).linkedin)).toBe(true);

    s = reduce(s, {
      type: 'SAVE_START',
      field: 'linkedin',
      value: '',
      requestId: 2,
    });
    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'linkedin',
      requestId: 1,
      values: { ...server, linkedin: 'abc' },
    });
    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'linkedin',
      requestId: 2,
      values: { ...server, linkedin: '' },
    });
    expect(fieldsOf(s).linkedin).toEqual({
      status: 'clean',
      value: '',
      serverValue: '',
    });
  });

  it('saves reverting to the old value while a save is in flight', () => {
    let s = start(loaded(), 'name', 'Ava', 1);
    s = reduce(s, { type: 'EDIT', field: 'name', value: 'Ada' });
    expect(shouldSave(fieldsOf(s).name)).toBe(true);
  });

  it('REJECT mid-save falls back to the value being saved', () => {
    let s = start(loaded(), 'name', 'Ava', 1);
    s = reduce(s, { type: 'EDIT', field: 'name', value: '' });
    s = reduce(s, { type: 'REJECT', field: 'name', message: 'empty' });
    expect(fieldsOf(s).name).toMatchObject({ status: 'saving', value: 'Ava' });
    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'name',
      requestId: 1,
      values: { ...server, name: 'Ava' },
    });
    expect(fieldsOf(s).name.status).toBe('clean');
  });

  it('ignores an older snapshot for fields a newer save already updated', () => {
    let s = start(loaded(), 'name', 'Ava', 1);
    s = start(s, 'github', 'new', 2);
    // the newer (github) response lands first, carrying name too
    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'github',
      requestId: 2,
      values: { ...server, name: 'Ava', github: 'new' },
    });
    // name's own response still resolves name...
    s = reduce(s, {
      type: 'SAVE_SUCCESS',
      field: 'name',
      requestId: 1,
      values: { ...server, name: 'Ava', github: 'ada-gh' },
    });
    expect(fieldsOf(s).name.status).toBe('clean');
    // ...but its stale value for the other field is not applied
    expect(fieldsOf(s).github).toEqual({
      status: 'clean',
      value: 'new',
      serverValue: 'new',
    });
  });
});

describe('shouldSave', () => {
  it('skips unchanged values and values already in flight', () => {
    expect(shouldSave({ status: 'clean', value: 'a', serverValue: 'a' })).toBe(
      false
    );
    expect(shouldSave({ status: 'dirty', value: 'b', serverValue: 'a' })).toBe(
      true
    );
    const saving = {
      status: 'saving' as const,
      value: 'b',
      serverValue: 'a',
      savingValue: 'b',
      requestId: 1,
    };
    expect(shouldSave(saving)).toBe(false);
    expect(shouldSave({ ...saving, value: 'c' })).toBe(true);
  });
});
