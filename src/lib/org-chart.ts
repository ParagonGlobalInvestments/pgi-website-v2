import type { SupabaseClient } from '@supabase/supabase-js';
import { SCHOOL_LABELS } from '@/components/portal/constants';
import { getCmsPeople } from '@/lib/cms/queries';
import { UNIVERSITIES } from '@/lib/constants/universities';
import type {
  OrgChart,
  OrgOfficer,
  OrgPerson,
  OrgSeat,
  OrgSeatSlug,
  Pod,
  PodMember,
  PodSeat,
  UserProgram,
} from '@/types';

// ============================================================================
// Leadership (from the CMS `officers` group)
// ============================================================================

/** Chart slots, in display order. */
const SEATS: { slug: OrgSeatSlug; title: string }[] = [
  { slug: 'ceo', title: 'CEO' },
  { slug: 'cio', title: 'CIO' },
  { slug: 'vp-education', title: 'VP Education' },
  { slug: 'cto', title: 'CTO' },
  { slug: 'coo-value', title: 'COO (Value)' },
  { slug: 'coo-quant', title: 'COO (Systematic)' },
];

/**
 * Map a free-text CMS officer title to a chart slot.
 * Returns null for titles that don't fit a slot (shown as "Other officers").
 */
export function matchOfficerSeat(title: string | null): OrgSeatSlug | null {
  if (!title) return null;
  const t = title.toLowerCase();

  if (/\bcoo\b|chief operating/.test(t)) {
    if (/quant|systematic/.test(t)) return 'coo-quant';
    if (/value|fundamental/.test(t)) return 'coo-value';
    return null;
  }
  if (/\bcio\b|chief investment/.test(t)) return 'cio';
  if (/\bcto\b|chief technology/.test(t)) return 'cto';
  if (/\bceo\b|chief executive|^(co-?)?president\b/.test(t)) return 'ceo';
  if (/education/.test(t)) return 'vp-education';
  return null;
}

/** Short chapter label from a slug ('columbia') or full name ('Columbia University'). */
function shortSchool(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  const key = v.toLowerCase();
  const uni = UNIVERSITIES.find(
    u => u.name === key || u.displayName.toLowerCase() === key
  );
  return uni ? (SCHOOL_LABELS[uni.name] ?? uni.displayName) : v;
}

async function getLeadership(): Promise<
  Pick<OrgChart, 'seats' | 'otherOfficers'>
> {
  const officers = await getCmsPeople('officers');
  const seats: OrgSeat[] = SEATS.map(s => ({ ...s, people: [] }));
  const bySlug = new Map(seats.map(s => [s.slug, s]));
  const otherOfficers: OrgOfficer[] = [];

  for (const officer of officers) {
    const person: OrgPerson = {
      id: officer.id,
      name: officer.name,
      school: shortSchool(officer.school),
    };
    const slug = matchOfficerSeat(officer.title);
    if (slug) bySlug.get(slug)!.people.push(person);
    else otherOfficers.push({ ...person, title: officer.title });
  }

  return { seats, otherOfficers };
}

// ============================================================================
// Pods
// ============================================================================

interface PersonRow {
  id: string;
  name: string;
  school: string | null;
}

interface PodMemberRow {
  id: string;
  seat: string;
  sort_order: number;
  /** Sheet name, set when there's no user record yet. */
  name: string | null;
  person: PersonRow | null;
}

const MEMBER_COLUMNS =
  'id, seat, sort_order, name, person:users(id, name, school)';

/** The linked user, or the sheet name for people without a user record. */
function toPerson(m: PodMemberRow): OrgPerson | null {
  if (m.person) {
    return {
      id: m.person.id,
      name: m.person.name,
      school: shortSchool(m.person.school),
    };
  }
  return m.name ? { id: m.id, name: m.name, school: null } : null;
}

interface PodRow {
  id: string;
  program: string;
  number: number;
  focus: string | null;
  members: PodMemberRow[] | null;
}

const SEAT_ORDER: Record<PodSeat, number> = { committee: 0, pm: 1, analyst: 2 };

function toPod(row: PodRow): Pod {
  const members: PodMember[] = (row.members ?? [])
    .toSorted(
      (a, b) =>
        SEAT_ORDER[a.seat as PodSeat] - SEAT_ORDER[b.seat as PodSeat] ||
        a.sort_order - b.sort_order
    )
    .flatMap(m => {
      const person = toPerson(m);
      return person ? [{ id: m.id, seat: m.seat as PodSeat, person }] : [];
    });

  return {
    id: row.id,
    program: row.program as UserProgram,
    number: row.number,
    focus: row.focus,
    members,
  };
}

async function getPods(supabase: SupabaseClient): Promise<Pod[]> {
  const { data, error } = await supabase
    .from('pods')
    .select(
      `id, program, number, focus, members:pod_members(${MEMBER_COLUMNS})`
    )
    .order('sort_order');

  if (error) {
    // Expected until migration 019_pods is applied.
    console.error('Org chart pods query failed:', error.message);
    return [];
  }
  return (data as unknown as PodRow[]).map(toPod);
}

async function getUnassigned(supabase: SupabaseClient): Promise<OrgPerson[]> {
  const { data, error } = await supabase
    .from('pod_members')
    .select(MEMBER_COLUMNS)
    .is('pod_id', null)
    .order('sort_order');

  if (error) {
    console.error('Org chart unassigned query failed:', error.message);
    return [];
  }
  return (data as unknown as PodMemberRow[]).flatMap(m => {
    const person = toPerson(m);
    return person ? [person] : [];
  });
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Load leadership (CMS officers) and pods for the portal org chart.
 * `supabase` must be the admin client (pods and users are service-role only);
 * check membership first.
 */
export async function getOrgChart(supabase: SupabaseClient): Promise<OrgChart> {
  const [leadership, pods, unassigned] = await Promise.all([
    getLeadership(),
    getPods(supabase),
    getUnassigned(supabase),
  ]);
  return { ...leadership, pods, unassigned };
}
