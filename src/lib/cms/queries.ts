import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { UNIVERSITIES } from '@/lib/constants/universities';
import type {
  CmsPerson,
  CmsStatistic,
  CmsTimelineEvent,
  CmsSponsor,
  PeopleGroupSlug,
  SponsorType,
} from './types';

/**
 * Server-side CMS queries.
 * Uses the admin (service role) client so RLS SELECT-for-all works,
 * and returns empty arrays if Supabase is unavailable (build-safe).
 */

function getClient() {
  return getSupabaseAdminClient();
}

const SCHOOL_LABELS = new Map(
  UNIVERSITIES.map(u => [u.name.toLowerCase(), u.displayName])
);
const SYNTHETIC_LINKEDIN_PREFIX = '__missing_linkedin__:';

function normalizeNullable(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeLinkedin(value: string | null | undefined): string | null {
  const normalized = normalizeNullable(value);
  if (!normalized) return null;
  if (normalized.startsWith(SYNTHETIC_LINKEDIN_PREFIX)) return null;
  return normalized;
}

function formatSchool(school: string | null | undefined): string | null {
  const normalized = normalizeNullable(school);
  if (!normalized) return null;
  return SCHOOL_LABELS.get(normalized.toLowerCase()) ?? normalized;
}

interface UserMembershipRow {
  id: string;
  group_slug: PeopleGroupSlug;
  sort_order: number;
  created_at: string;
  updated_at: string;
  user:
    | {
        id: string;
        name: string;
        school: string | null;
        linkedin_url: string | null;
      }
    | {
        id: string;
        name: string;
        school: string | null;
        linkedin_url: string | null;
      }[]
    | null;
  source:
    | {
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }
    | {
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }[]
    | null;
}

interface AlumniMembershipRow {
  id: string;
  group_slug: PeopleGroupSlug;
  sort_order: number;
  created_at: string;
  updated_at: string;
  alumni:
    | {
        id: string;
        name: string;
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }
    | {
        id: string;
        name: string;
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }[]
    | null;
  source:
    | {
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }
    | {
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }[]
    | null;
}

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function mapUserMembershipToCmsPerson(row: UserMembershipRow): CmsPerson {
  const user = pickOne(row.user);
  const source = pickOne(row.source);

  return {
    id: row.id,
    group_slug: row.group_slug,
    name: normalizeNullable(user?.name) ?? 'Unknown',
    title: normalizeNullable(source?.title),
    school: formatSchool(user?.school ?? source?.school),
    company: normalizeNullable(source?.company),
    linkedin: normalizeLinkedin(user?.linkedin_url ?? source?.linkedin),
    headshot_url: normalizeNullable(source?.headshot_url),
    banner_url: normalizeNullable(source?.banner_url),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapAlumniMembershipToCmsPerson(row: AlumniMembershipRow): CmsPerson {
  const alumni = pickOne(row.alumni);
  const source = pickOne(row.source);

  return {
    id: row.id,
    group_slug: row.group_slug,
    name: normalizeNullable(alumni?.name) ?? 'Unknown',
    title: normalizeNullable(alumni?.title ?? source?.title),
    school: formatSchool(alumni?.school ?? source?.school),
    company: normalizeNullable(alumni?.company ?? source?.company),
    linkedin: normalizeLinkedin(alumni?.linkedin ?? source?.linkedin),
    headshot_url: normalizeNullable(
      alumni?.headshot_url ?? source?.headshot_url
    ),
    banner_url: normalizeNullable(alumni?.banner_url ?? source?.banner_url),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getCmsPeopleFromMembershipTables(
  group: PeopleGroupSlug,
  options?: {
    includeAlumni?: boolean;
    usersOnly?: boolean;
  }
): Promise<CmsPerson[] | null> {
  const client = getClient();
  if (!client) return [];
  const includeAlumni = options?.includeAlumni ?? true;
  const usersOnly = options?.usersOnly ?? false;

  const userPromise = client
    .from('user_public_group_memberships')
    .select(
      `
        id,
        group_slug,
        sort_order,
        created_at,
        updated_at,
        user:users (
          id,
          name,
          school,
          linkedin_url
        ),
        source:cms_people (
          school,
          title,
          company,
          linkedin,
          headshot_url,
          banner_url
        )
      `
    )
    .eq('group_slug', group)
    .order('sort_order', { ascending: true });

  const alumniPromise = includeAlumni
    ? client
        .from('alumni_public_group_memberships')
        .select(
          `
            id,
            group_slug,
            sort_order,
            created_at,
            updated_at,
            alumni:alumni_people (
              id,
              name,
              school,
              title,
              company,
              linkedin,
              headshot_url,
              banner_url
            ),
            source:cms_people (
              school,
              title,
              company,
              linkedin,
              headshot_url,
              banner_url
            )
          `
        )
        .eq('group_slug', group)
        .order('sort_order', { ascending: true })
    : Promise.resolve({
        data: [],
        error: null,
      } as {
        data: AlumniMembershipRow[];
        error: null;
      });

  const [userResult, alumniResult] = await Promise.all([
    userPromise,
    alumniPromise,
  ]);

  if (userResult.error || alumniResult.error) {
    // Expected before migration is applied or if relationships are unavailable.
    return null;
  }

  const users = ((userResult.data as UserMembershipRow[] | null) ?? [])
    .filter(row => !usersOnly || pickOne(row.user) !== null)
    .map(mapUserMembershipToCmsPerson);
  const alumni = (
    (alumniResult.data as AlumniMembershipRow[] | null) ?? []
  ).map(mapAlumniMembershipToCmsPerson);

  return [...users, ...alumni].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.name.localeCompare(b.name);
  });
}

export async function getCmsPeople(
  group: PeopleGroupSlug,
  options?: {
    includeAlumni?: boolean;
    usersOnly?: boolean;
    fallbackToCmsPeople?: boolean;
  }
): Promise<CmsPerson[]> {
  const membershipRows = await getCmsPeopleFromMembershipTables(group, options);
  if (membershipRows) return membershipRows;
  const fallbackToCmsPeople = options?.fallbackToCmsPeople ?? true;
  if (!fallbackToCmsPeople) return [];

  const client = getClient();
  if (!client) return [];
  const { data, error } = await client
    .from('cms_people')
    .select('*')
    .eq('group_slug', group)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error(`getCmsPeople(${group}):`, error.message);
    return [];
  }
  return data ?? [];
}

export async function getCmsRecruitment(): Promise<Record<string, string>> {
  const client = getClient();
  if (!client) return {};
  const { data, error } = await client
    .from('cms_recruitment')
    .select('key, value');
  if (error) {
    console.error('getCmsRecruitment:', error.message);
    return {};
  }
  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }
  return map;
}

export async function getCmsStatistics(): Promise<CmsStatistic[]> {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client
    .from('cms_statistics')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('getCmsStatistics:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getCmsTimeline(): Promise<CmsTimelineEvent[]> {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client
    .from('cms_timeline')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('getCmsTimeline:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getCmsSponsors(type: SponsorType): Promise<CmsSponsor[]> {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client
    .from('cms_sponsors')
    .select('*')
    .eq('type', type)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error(`getCmsSponsors(${type}):`, error.message);
    return [];
  }
  return data ?? [];
}
