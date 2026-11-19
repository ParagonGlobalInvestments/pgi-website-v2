import {
  searchQuery,
  searchView,
  withoutCandidate,
  type Candidate,
} from './addPersonSearch';

const ada: Candidate = { id: '1', name: 'Ada Lovelace', school: 'uchicago' };
const alan: Candidate = { id: '2', name: 'Alan Turing', school: null };

describe('searchQuery', () => {
  it('trims and requires two characters', () => {
    expect(searchQuery('')).toBeNull();
    expect(searchQuery(' a ')).toBeNull();
    expect(searchQuery(' ad ')).toBe('ad');
  });
});

describe('searchView', () => {
  it('shows the hint while the input is too short, even with results', () => {
    expect(searchView('a', null)).toEqual({ kind: 'hint' });
    expect(
      searchView('a', { query: 'ad', status: 'found', candidates: [ada] })
    ).toEqual({
      kind: 'hint',
    });
  });

  it('is searching before the first search finishes', () => {
    expect(searchView('ad', null)).toEqual({ kind: 'searching' });
  });

  it('shows results for the current query', () => {
    expect(
      searchView(' ad ', { query: 'ad', status: 'found', candidates: [ada] })
    ).toEqual({
      kind: 'results',
      candidates: [ada],
      stale: false,
    });
  });

  it('shows an empty answer for the current query as results', () => {
    expect(
      searchView('zz', { query: 'zz', status: 'found', candidates: [] })
    ).toEqual({
      kind: 'results',
      candidates: [],
      stale: false,
    });
  });

  it('marks results for an earlier query as stale', () => {
    expect(
      searchView('ada', {
        query: 'ad',
        status: 'found',
        candidates: [ada, alan],
      })
    ).toEqual({ kind: 'results', candidates: [ada, alan], stale: true });
  });

  it('treats an empty answer to an earlier query as still searching', () => {
    expect(
      searchView('ada', { query: 'zz', status: 'found', candidates: [] })
    ).toEqual({
      kind: 'searching',
    });
  });

  it('shows an error when the search for the current query failed', () => {
    expect(searchView('ad', { query: 'ad', status: 'failed' })).toEqual({
      kind: 'error',
    });
  });

  it('treats a failure for an earlier query as still searching', () => {
    expect(searchView('ada', { query: 'ad', status: 'failed' })).toEqual({
      kind: 'searching',
    });
  });
});

describe('withoutCandidate', () => {
  it('removes the added candidate and keeps the query', () => {
    expect(
      withoutCandidate(
        { query: 'al', status: 'found', candidates: [ada, alan] },
        '1'
      )
    ).toEqual({ query: 'al', status: 'found', candidates: [alan] });
  });

  it('turns a stale list that loses its last candidate into searching', () => {
    const left = withoutCandidate(
      { query: 'ad', status: 'found', candidates: [ada] },
      '1'
    );
    expect(searchView('ada', left)).toEqual({ kind: 'searching' });
  });

  it('leaves no results and failed searches alone', () => {
    expect(withoutCandidate(null, '1')).toBeNull();
    expect(withoutCandidate({ query: 'ad', status: 'failed' }, '1')).toEqual({
      query: 'ad',
      status: 'failed',
    });
  });
});
