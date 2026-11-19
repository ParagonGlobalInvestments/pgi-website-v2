import {
  LOADING,
  dataOr,
  failed,
  fetchFailed,
  isFetching,
  mapReady,
  ready,
  startFetch,
} from './async-state';

describe('AsyncState', () => {
  it('maps only ready data, keeping the refresh flag', () => {
    const double = (n: number) => n * 2;
    expect(mapReady(ready(2), double)).toEqual(ready(4));
    expect(mapReady(startFetch(ready(2)), double)).toEqual({
      status: 'ready',
      data: 4,
      refreshing: true,
    });
    expect(mapReady<number>(LOADING, double)).toBe(LOADING);
    const err = failed<number>('nope');
    expect(mapReady(err, double)).toBe(err);
  });

  it('falls back when not ready', () => {
    expect(dataOr(ready([1]), [])).toEqual([1]);
    expect(dataOr<number[]>(LOADING, [])).toEqual([]);
    expect(dataOr(failed<number[]>('nope'), [])).toEqual([]);
  });

  it('keeps loaded data while refreshing', () => {
    const refreshing = startFetch(ready([1]));
    expect(refreshing).toEqual({
      status: 'ready',
      data: [1],
      refreshing: true,
    });
    expect(isFetching(refreshing)).toBe(true);
    expect(startFetch(refreshing)).toBe(refreshing);
  });

  it('starts from loading when there is no data', () => {
    expect(startFetch<number>(LOADING)).toBe(LOADING);
    expect(startFetch(failed<number>('nope'))).toBe(LOADING);
    expect(isFetching(LOADING)).toBe(true);
    expect(isFetching(ready(1))).toBe(false);
    expect(isFetching(failed('nope'))).toBe(false);
  });

  it('keeps loaded data when a refetch fails', () => {
    expect(fetchFailed(startFetch(ready([1])), 'nope')).toEqual(ready([1]));
  });

  it('errors when the first fetch fails', () => {
    expect(fetchFailed<number>(LOADING, 'nope')).toEqual(failed('nope'));
  });
});
