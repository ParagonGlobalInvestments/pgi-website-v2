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
  { slug: 'coo-quant', title: 'COO (Quant)' },
];

/**
 * Map a free-text CMS officer title to a chart slot.
 * Returns null for titles that don't fit a slot (shown as "Other officers").
 */
export function matchOfficerSeat(title: string | null): OrgSeatSlug | null {
  if (!title) return null;
  const t = title.toLowerCase();

  if (/\bcoo\b|chief operating/.test(t)) {
    if (/quant/.test(t)) return 'coo-quant';
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
  is_new: boolean;
  sort_order: number;
  person: PersonRow | null;
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
    .filter((m): m is PodMemberRow & { person: PersonRow } => !!m.person)
    .sort(
      (a, b) =>
        SEAT_ORDER[a.seat as PodSeat] - SEAT_ORDER[b.seat as PodSeat] ||
        a.sort_order - b.sort_order
    )
    .map(m => ({
      id: m.id,
      seat: m.seat as PodSeat,
      isNew: m.is_new,
      person: {
        id: m.person.id,
        name: m.person.name,
        school: shortSchool(m.person.school),
      },
    }));

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
      'id, program, number, focus, members:pod_members(id, seat, is_new, sort_order, person:users(id, name, school))'
    )
    .order('sort_order');

  if (error) {
    // Expected until the pods migration is applied.
    console.error('Org chart pods query failed:', error.message);
    return [];
  }
  return (data as unknown as PodRow[]).map(toPod);
}

// ============================================================================
// Public API
// ============================================================================

/** Load leadership (CMS officers) and pods for the portal org chart. */
export async function getOrgChart(supabase: SupabaseClient): Promise<OrgChart> {
  const [leadership, pods] = await Promise.all([
    getLeadership(),
    getPods(supabase),
  ]);
  return { ...leadership, pods };
}
