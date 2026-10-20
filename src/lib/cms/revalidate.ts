import { revalidatePath } from 'next/cache';
import type { PeopleGroupSlug } from './types';

/**
 * CMS Revalidation — maps CMS tables to public page paths.
 *
 * When an admin saves a CMS change, call the appropriate function
 * to purge the cached page so the next visitor sees fresh data.
 */

const PEOPLE_GROUP_PATHS: Record<PeopleGroupSlug, string[]> = {
  officers: ['/national-committee/officers'],
  'alumni-board': ['/national-committee/officers'],
  founders: ['/national-committee/founders'],
  'chapter-founders': ['/national-committee/founders'],
  'investment-committee': ['/members/value-team'],
  'portfolio-managers': ['/members/value-team'],
  'value-analysts': ['/members/value-team'],
  'quant-research-committee': ['/members/quant-team'],
  'quant-analysts': ['/members/quant-team'],
  'recruitment-team': ['/apply'],
};

export function revalidatePeople(groupSlug?: PeopleGroupSlug) {
  if (groupSlug && PEOPLE_GROUP_PATHS[groupSlug]) {
    for (const path of PEOPLE_GROUP_PATHS[groupSlug]) {
      revalidatePath(path);
    }
  } else {
    // No specific group — revalidate all people pages
    const seen = new Set<string>();
    for (const paths of Object.values(PEOPLE_GROUP_PATHS)) {
      for (const path of paths) {
        if (!seen.has(path)) {
          seen.add(path);
          revalidatePath(path);
        }
      }
    }
  }
}

export function revalidateRecruitment() {
  revalidatePath('/apply');
}

export function revalidateStatistics() {
  revalidatePath('/');
}

export function revalidateTimeline() {
  revalidatePath('/who-we-are');
}

export function revalidateSponsors() {
  revalidatePath('/');
  revalidatePath('/sponsors');
}

export function revalidateResources() {
  // Resources are portal-only (no public page to revalidate),
  // but we invalidate the API route cache.
  revalidatePath('/api/resources');
}

const DATABASE_REVALIDATORS: Record<string, () => void> = {
  // Shared profiles and memberships can affect more than one public group.
  cms_people: revalidatePeople,
  users: revalidatePeople,
  alumni_people: revalidatePeople,
  user_public_group_memberships: revalidatePeople,
  alumni_public_group_memberships: revalidatePeople,
  cms_recruitment: revalidateRecruitment,
  cms_statistics: revalidateStatistics,
  cms_timeline: revalidateTimeline,
  cms_sponsors: revalidateSponsors,
  resources: revalidateResources,
};

export function revalidateDatabaseChange(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return false;
  }

  const { schema, table, type } = payload as Record<string, unknown>;
  if (
    schema !== 'public' ||
    typeof table !== 'string' ||
    !Object.prototype.hasOwnProperty.call(DATABASE_REVALIDATORS, table) ||
    (type !== 'INSERT' && type !== 'UPDATE' && type !== 'DELETE')
  ) {
    return false;
  }

  DATABASE_REVALIDATORS[table]();
  return true;
}
