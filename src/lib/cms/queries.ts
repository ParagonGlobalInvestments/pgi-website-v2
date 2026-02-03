import { getSupabaseAdminClient } from '@/lib/supabase/admin';
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

export async function getCmsPeople(group: PeopleGroupSlug): Promise<CmsPerson[]> {
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
