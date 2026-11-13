/**
 * Alumni directory helpers (pure, shared by the API route and its tests).
 */

export interface CompanyExperience {
  user_id: string;
  company: string | null;
  end_year: number | null;
  sort_order: number | null;
}

export interface CompanyListing {
  user_id: string;
  company: string | null;
  updated_at: string | null;
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Pick each alumnus's current company.
 *
 * 1. The first ongoing experience entry (no end year) in the user's own order.
 * 2. Otherwise the entry that ended most recently.
 * 3. Otherwise the company on their most recently updated public CMS listing
 *    (where migrated alumni kept their company, see migration 016).
 */
export function pickCurrentCompanies(
  experience: CompanyExperience[],
  listings: CompanyListing[] = []
): Map<string, string> {
  const byUser = new Map<string, CompanyExperience[]>();
  for (const entry of experience) {
    if (!clean(entry.company)) continue;
    const list = byUser.get(entry.user_id) ?? [];
    list.push(entry);
    byUser.set(entry.user_id, list);
  }

  const result = new Map<string, string>();

  for (const [userId, entries] of Array.from(byUser)) {
    const ordered = [...entries].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    const current =
      ordered.find(entry => entry.end_year == null) ??
      ordered.reduce((latest, entry) =>
        (entry.end_year ?? 0) > (latest.end_year ?? 0) ? entry : latest
      );
    result.set(userId, clean(current.company)!);
  }

  const latestListings = [...listings].sort((a, b) =>
    (b.updated_at ?? '').localeCompare(a.updated_at ?? '')
  );
  for (const listing of latestListings) {
    const company = clean(listing.company);
    if (company && !result.has(listing.user_id)) {
      result.set(listing.user_id, company);
    }
  }

  return result;
}

/** Drop missing parts so the card line reads e.g. "School | Class of 2024". */
export function presentParts(
  parts: Array<string | null | undefined>
): string[] {
  return parts.filter((part): part is string => Boolean(part?.trim()));
}
