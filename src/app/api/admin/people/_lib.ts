import {
  PEOPLE_GROUPS,
  type CmsPerson,
  type PeopleGroupSlug,
} from '@/lib/cms/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminPersonType = 'user' | 'alumni';
export const SYNTHETIC_LINKEDIN_PREFIX = '__missing_linkedin__:';

export interface AdminCmsPerson extends CmsPerson {
  person_type: AdminPersonType;
  user_id: string | null;
  alumni_person_id: string | null;
  source_cms_person_id: string | null;
}

interface UserMembershipRow {
  id: string;
  group_slug: PeopleGroupSlug;
  sort_order: number;
  source_cms_person_id: string | null;
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
        name: string | null;
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }
    | {
        name: string | null;
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
  source_cms_person_id: string | null;
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
        name: string | null;
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }
    | {
        name: string | null;
        school: string | null;
        title: string | null;
        company: string | null;
        linkedin: string | null;
        headshot_url: string | null;
        banner_url: string | null;
      }[]
    | null;
}

const VALID_GROUP_SET = new Set<string>(PEOPLE_GROUPS.map(group => group.slug));

export function isPeopleGroupSlug(value: string): value is PeopleGroupSlug {
  return VALID_GROUP_SET.has(value);
}

export function toExternalPersonId(
  type: AdminPersonType,
  membershipId: string
) {
  return `${type}:${membershipId}`;
}

export function parseExternalPersonId(
  externalId: string
): { type: AdminPersonType; membershipId: string } | null {
  const [type, membershipId, ...rest] = externalId.split(':');
  if (rest.length > 0) return null;
  if (!membershipId) return null;
  if (type !== 'user' && type !== 'alumni') return null;
  return { type, membershipId };
}

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function normalizeNullable(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isSyntheticLinkedin(value: string | null | undefined): boolean {
  return (
    typeof value === 'string' && value.startsWith(SYNTHETIC_LINKEDIN_PREFIX)
  );
}

export function createSyntheticLinkedinToken(): string {
  return `${SYNTHETIC_LINKEDIN_PREFIX}${crypto.randomUUID()}`;
}

function normalizeLinkedin(value: unknown): string | null {
  const normalized = normalizeNullable(value);
  if (!normalized) return null;
  if (isSyntheticLinkedin(normalized)) return null;
  return normalized;
}

export function trimNullable(value: unknown): string | null {
  return normalizeNullable(value);
}

export function trimRequired(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isMembershipSchemaError(error: unknown): boolean {
  const message =
    typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : error instanceof Error
        ? error.message
        : '';
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code ?? '')
      : '';

  if (code === '42P01' || code === 'PGRST200') return true;

  return (
    message.includes('user_public_group_memberships') ||
    message.includes('alumni_public_group_memberships') ||
    message.includes('alumni_people') ||
    message.includes('relationship')
  );
}

export function mapUserMembershipToPerson(
  row: UserMembershipRow
): AdminCmsPerson {
  const user = pickOne(row.user);
  const source = pickOne(row.source);

  return {
    id: toExternalPersonId('user', row.id),
    group_slug: row.group_slug,
    name:
      normalizeNullable(user?.name) ??
      normalizeNullable(source?.name) ??
      'Unknown',
    title: normalizeNullable(source?.title),
    school: normalizeNullable(user?.school ?? source?.school),
    company: normalizeNullable(source?.company),
    linkedin: normalizeLinkedin(user?.linkedin_url ?? source?.linkedin),
    headshot_url: normalizeNullable(source?.headshot_url),
    banner_url: normalizeNullable(source?.banner_url),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    person_type: 'user',
    user_id: user?.id ?? null,
    alumni_person_id: null,
    source_cms_person_id: row.source_cms_person_id,
  };
}

export function mapAlumniMembershipToPerson(
  row: AlumniMembershipRow
): AdminCmsPerson {
  const alumni = pickOne(row.alumni);
  const source = pickOne(row.source);

  return {
    id: toExternalPersonId('alumni', row.id),
    group_slug: row.group_slug,
    name:
      normalizeNullable(alumni?.name) ??
      normalizeNullable(source?.name) ??
      'Unknown',
    title: normalizeNullable(alumni?.title ?? source?.title),
    school: normalizeNullable(alumni?.school ?? source?.school),
    company: normalizeNullable(alumni?.company ?? source?.company),
    linkedin: normalizeLinkedin(alumni?.linkedin ?? source?.linkedin),
    headshot_url: normalizeNullable(
      alumni?.headshot_url ?? source?.headshot_url
    ),
    banner_url: normalizeNullable(alumni?.banner_url ?? source?.banner_url),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    person_type: 'alumni',
    user_id: null,
    alumni_person_id: alumni?.id ?? null,
    source_cms_person_id: row.source_cms_person_id,
  };
}

export async function listAdminPeople(
  supabase: SupabaseClient,
  group?: PeopleGroupSlug
): Promise<AdminCmsPerson[]> {
  const userQuery = supabase
    .from('user_public_group_memberships')
    .select(
      `
      id,
      group_slug,
      sort_order,
      source_cms_person_id,
      created_at,
      updated_at,
      user:users (
        id,
        name,
        school,
        linkedin_url
      ),
      source:cms_people (
        name,
        school,
        title,
        company,
        linkedin,
        headshot_url,
        banner_url
      )
    `
    )
    .order('sort_order', { ascending: true });

  const alumniQuery = supabase
    .from('alumni_public_group_memberships')
    .select(
      `
      id,
      group_slug,
      sort_order,
      source_cms_person_id,
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
        name,
        school,
        title,
        company,
        linkedin,
        headshot_url,
        banner_url
      )
    `
    )
    .order('sort_order', { ascending: true });

  if (group) {
    userQuery.eq('group_slug', group);
    alumniQuery.eq('group_slug', group);
  }

  const [userResult, alumniResult] = await Promise.all([
    userQuery,
    alumniQuery,
  ]);

  if (userResult.error) throw userResult.error;
  if (alumniResult.error) throw alumniResult.error;

  const users = ((userResult.data as UserMembershipRow[] | null) ?? []).map(
    mapUserMembershipToPerson
  );
  const alumni = (
    (alumniResult.data as AlumniMembershipRow[] | null) ?? []
  ).map(mapAlumniMembershipToPerson);

  return [...users, ...alumni].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.name.localeCompare(b.name);
  });
}

export async function getAdminPersonByExternalId(
  supabase: SupabaseClient,
  externalId: string
): Promise<AdminCmsPerson | null> {
  const parsed = parseExternalPersonId(externalId);
  if (!parsed) return null;

  if (parsed.type === 'user') {
    const { data, error } = await supabase
      .from('user_public_group_memberships')
      .select(
        `
        id,
        group_slug,
        sort_order,
        source_cms_person_id,
        created_at,
        updated_at,
        user:users (
          id,
          name,
          school,
          linkedin_url
        ),
        source:cms_people (
          name,
          school,
          title,
          company,
          linkedin,
          headshot_url,
          banner_url
        )
      `
      )
      .eq('id', parsed.membershipId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapUserMembershipToPerson(data as UserMembershipRow);
  }

  const { data, error } = await supabase
    .from('alumni_public_group_memberships')
    .select(
      `
      id,
      group_slug,
      sort_order,
      source_cms_person_id,
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
        name,
        school,
        title,
        company,
        linkedin,
        headshot_url,
        banner_url
      )
    `
    )
    .eq('id', parsed.membershipId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapAlumniMembershipToPerson(data as AlumniMembershipRow);
}
