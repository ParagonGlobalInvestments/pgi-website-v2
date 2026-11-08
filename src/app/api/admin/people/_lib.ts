import {
  PEOPLE_GROUPS,
  type CmsPerson,
  type PeopleGroupSlug,
} from '@/lib/cms/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminPersonType = 'user' | 'alumni';

export interface AdminCmsPerson extends CmsPerson {
  person_type: AdminPersonType;
  user_id: string | null;
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
        status: string | null;
      }
    | {
        id: string;
        name: string;
        school: string | null;
        linkedin_url: string | null;
        status: string | null;
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
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPeopleGroupSlug(value: string): value is PeopleGroupSlug {
  return VALID_GROUP_SET.has(value);
}

export function toExternalPersonId(membershipId: string) {
  return `user:${membershipId}`;
}

export function parseExternalPersonId(
  externalId: string
): { membershipId: string } | null {
  const [type, membershipId, ...rest] = externalId.split(':');
  if (rest.length > 0) return null;
  if (!membershipId) return null;
  if (type !== 'user') return null;
  if (!UUID_RE.test(membershipId)) return null;
  return { membershipId };
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

  return message.includes('user_public_group_memberships');
}

export function mapUserMembershipToPerson(
  row: UserMembershipRow
): AdminCmsPerson {
  const user = pickOne(row.user);
  const source = pickOne(row.source);

  return {
    id: toExternalPersonId(row.id),
    group_slug: row.group_slug,
    name:
      normalizeNullable(user?.name) ??
      normalizeNullable(source?.name) ??
      'Unknown',
    title: normalizeNullable(source?.title),
    school: normalizeNullable(user?.school ?? source?.school),
    company: normalizeNullable(source?.company),
    linkedin: normalizeNullable(user?.linkedin_url ?? source?.linkedin),
    headshot_url: normalizeNullable(source?.headshot_url),
    banner_url: normalizeNullable(source?.banner_url),
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    person_type: user?.status === 'alumni' ? 'alumni' : 'user',
    user_id: user?.id ?? null,
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
        linkedin_url,
        status
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
  }

  const { data, error } = await userQuery;

  if (error) throw error;

  return ((data as UserMembershipRow[] | null) ?? [])
    .map(mapUserMembershipToPerson)
    .sort((a, b) => {
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
        linkedin_url,
        status
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
