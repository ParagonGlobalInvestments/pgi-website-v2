/**
 * Search state for the "Add person" dialog.
 *
 * The only stored state is the latest finished search, tagged with the query
 * it answers. What the dialog shows is derived from that and the current
 * input, so "results for a different query" and "still searching" are explicit
 * instead of being inferred from `results === null` and the input length.
 */

export interface Candidate {
  id: string;
  name: string;
  school: string | null;
}

export const MIN_QUERY_LENGTH = 2;

/**
 * The latest finished search, tagged with the query it answers, or null
 * before any search has finished.
 */
export type SearchResults =
  | { query: string; status: 'found'; candidates: Candidate[] }
  | { query: string; status: 'failed' }
  | null;

export type SearchView =
  /** The input is too short to search. */
  | { kind: 'hint' }
  /** A search is pending and there is nothing to show yet. */
  | { kind: 'searching' }
  /** The search for the current input failed (network, auth, server). */
  | { kind: 'error' }
  /**
   * Candidates from the latest finished search. `stale` means they answer an
   * earlier query, so a search for the current input is pending. `stale:
   * false` only says the results match the input; a repeat search for the
   * same query (e.g. after deleting and retyping a letter) may be in flight.
   */
  | { kind: 'results'; candidates: Candidate[]; stale: boolean };

/** The query to search for, or null when the input is too short. */
export function searchQuery(input: string): string | null {
  const q = input.trim();
  return q.length >= MIN_QUERY_LENGTH ? q : null;
}

export function searchView(input: string, results: SearchResults): SearchView {
  const q = searchQuery(input);
  if (q === null) return { kind: 'hint' };
  if (results === null) return { kind: 'searching' };
  const stale = results.query !== q;
  if (results.status === 'failed') {
    return stale ? { kind: 'searching' } : { kind: 'error' };
  }
  // An empty answer to an earlier query says nothing about this one.
  if (stale && results.candidates.length === 0) return { kind: 'searching' };
  return { kind: 'results', candidates: results.candidates, stale };
}

/** Drop a candidate once they've been added to the chart. */
export function withoutCandidate(
  results: SearchResults,
  id: string
): SearchResults {
  return results?.status === 'found'
    ? { ...results, candidates: results.candidates.filter(c => c.id !== id) }
    : results;
}
