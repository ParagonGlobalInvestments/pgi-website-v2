/**
 * Bulk graduation — shared between the admin API, the login prompt, and the
 * graduation console page.
 *
 * A class counts as graduated once June 15 of its class year has passed.
 * Members still marked `active` whose class year is on or before that year are
 * candidates to move to `alumni`.
 */

/** Month (1-12) and day after which the current year's class has graduated. */
export const GRADUATION_MONTH = 6;
export const GRADUATION_DAY = 15;

export const GRADUATION_API_PATH = '/api/admin/graduation';
export const GRADUATION_PAGE_PATH = '/portal/graduation';

export interface GraduationCandidate {
  id: string;
  name: string;
  email: string | null;
  school: string | null;
  graduationYear: number;
  role: string;
  program: string | null;
}

export interface GraduationOverview {
  /** Latest class year that has graduated as of today. */
  classYear: number;
  candidates: GraduationCandidate[];
}

/**
 * The most recent class year that has graduated as of `now`.
 * On or after June 15 that is the current year; before it, the previous year.
 */
export function getGraduatedClassYear(now: Date = new Date()): number {
  const year = now.getUTCFullYear();
  const cutoff = Date.UTC(year, GRADUATION_MONTH - 1, GRADUATION_DAY);
  return now.getTime() >= cutoff ? year : year - 1;
}

/** sessionStorage key so the prompt shows once per admin session per class. */
export function graduationPromptKey(classYear: number): string {
  return `pgi:graduation-prompt:${classYear}`;
}

/** SWR fetcher for `GRADUATION_API_PATH`. */
export async function fetchGraduationOverview(
  url: string
): Promise<GraduationOverview> {
  const res = await fetch(url);
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || 'Failed to load graduation list');
  }
  return json.data as GraduationOverview;
}
