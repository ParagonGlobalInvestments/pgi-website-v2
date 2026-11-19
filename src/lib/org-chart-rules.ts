/**
 * Org chart editing rules, shared by the API (enforcement) and the editor UI
 * (which only offers what the API will accept).
 *
 * - Admins can move anyone anywhere, fill lead seats, and manage pods.
 * - Pod leaders (the PM, or the ICOMM/QCOMM member) can move analysts between
 *   the pods they lead and "Not in a pod yet". They can't touch lead seats.
 */
import type {
  OrgChartViewer,
  Pod,
  PodMember,
  PodRoster,
  PodSeat,
  UserProgram,
  UserRole,
} from '@/types';

export type LeadSeat = Exclude<PodSeat, 'analyst'>;

export const POD_SEATS: PodSeat[] = ['committee', 'pm', 'analyst'];

/** Lead seats each pod has. Systematic (quant) pods have no PM. */
export const LEAD_SEATS: Record<UserProgram, LeadSeat[]> = {
  value: ['committee', 'pm'],
  quant: ['committee'],
};

export const POD_FOCUS_MAX_LENGTH = 80;

export function isLeadSeat(seat: PodSeat): seat is LeadSeat {
  return seat === 'committee' || seat === 'pm';
}

export function seatLabel(seat: PodSeat, program: UserProgram): string {
  if (seat === 'committee') return program === 'value' ? 'ICOMM' : 'QCOMM';
  if (seat === 'pm') return 'Pod Leader';
  return 'Analyst';
}

/** Whether `program` pods have `seat`. */
export function podHasSeat(program: UserProgram, seat: PodSeat): boolean {
  return seat === 'analyst' || LEAD_SEATS[program].includes(seat);
}

/**
 * Admin status from a membership check, matching requireAdmin(): an
 * allowlisted email without a user record, or a user with the admin role.
 */
export function isAdminMembership(m: {
  isAdminAllowlist: boolean;
  user: { role: UserRole } | null;
}): boolean {
  return (m.isAdminAllowlist && !m.user) || m.user?.role === 'admin';
}

/** Ids of the pods `userId` leads, as PM or ICOMM/QCOMM. */
export function ledPodIds(
  placements: Pick<PodMember, 'podId' | 'userId' | 'seat'>[],
  userId: string | null
): Set<string> {
  const ids = new Set<string>();
  if (!userId) return ids;
  for (const p of placements) {
    if (p.podId && p.userId === userId && isLeadSeat(p.seat)) ids.add(p.podId);
  }
  return ids;
}

export function rosterPlacements(roster: PodRoster): PodMember[] {
  return [...roster.pods.flatMap(p => p.members), ...roster.unassigned];
}

export interface MoveTarget {
  podId: string | null;
  seat: PodSeat;
}

/**
 * Whether the viewer may move a placement to `target`. `led` is the set of
 * pods the viewer leads (see ledPodIds).
 */
export function canMove(
  viewer: Pick<OrgChartViewer, 'isAdmin'>,
  led: Set<string>,
  member: Pick<PodMember, 'podId' | 'seat'>,
  target: MoveTarget
): boolean {
  if (target.podId === null && target.seat !== 'analyst') return false;
  if (viewer.isAdmin) return true;

  // A row without a pod counts as an analyst, whatever seat it last held.
  const fromSeat = member.podId === null ? 'analyst' : member.seat;
  if (fromSeat !== 'analyst' || target.seat !== 'analyst') return false;
  if (member.podId === target.podId) return false;

  const mine = (podId: string | null) => podId === null || led.has(podId);
  return mine(member.podId) && mine(target.podId);
}

/** Whether the viewer can edit anything at all. */
export function canEditChart(viewer: OrgChartViewer, roster: PodRoster) {
  return (
    viewer.isAdmin ||
    ledPodIds(rosterPlacements(roster), viewer.userId).size > 0
  );
}

/** Number for a new pod: value pods start at 1, Systematic pods at 11. */
export function nextPodNumber(
  pods: Pick<Pod, 'program' | 'number'>[],
  program: UserProgram
): number {
  const used = new Set(pods.map(p => p.number));
  const own = pods.filter(p => p.program === program).map(p => p.number);
  let n = own.length ? Math.max(...own) + 1 : program === 'value' ? 1 : 11;
  while (used.has(n)) n++;
  return n;
}

/**
 * Apply a move to a local copy of the roster, for an instant response to a
 * drop. The API's answer replaces it, so displaced lead-seat holders are
 * simply shown as analysts here.
 */
export function moveLocally(
  roster: PodRoster,
  memberId: string,
  target: MoveTarget
): PodRoster {
  const member = rosterPlacements(roster).find(m => m.id === memberId);
  if (!member) return roster;

  const moved: PodMember = {
    ...member,
    podId: target.podId,
    seat: target.podId === null ? 'analyst' : target.seat,
  };
  const demote = (m: PodMember): PodMember =>
    isLeadSeat(moved.seat) && m.seat === moved.seat
      ? { ...m, seat: 'analyst' }
      : m;

  const pods = roster.pods.map(pod => {
    const rest = pod.members.filter(m => m.id !== memberId);
    if (pod.id !== target.podId) return { ...pod, members: rest };
    const members = [...rest.map(demote), moved];
    const order: Record<PodSeat, number> = { committee: 0, pm: 1, analyst: 2 };
    return {
      ...pod,
      members: members.toSorted((a, b) => order[a.seat] - order[b.seat]),
    };
  });
  const unassigned = roster.unassigned.filter(m => m.id !== memberId);
  if (target.podId === null) unassigned.push(moved);

  return { pods, unassigned };
}

/** One person in the lead-seat dropdown. */
export interface SeatCandidate {
  /** The placement to move (or, with `copy`, to add a new one from). */
  member: PodMember;
  copy: boolean;
  /** Where the person is now, e.g. "Analyst · Pod 2". */
  where: string;
}

/** Placements grouped by person: by user, or by sheet name. */
function byPerson(placements: PodMember[]): PodMember[][] {
  const groups = new Map<string, PodMember[]>();
  for (const p of placements) {
    const key = p.userId ?? `name:${p.person.name}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return Array.from(groups.values());
}

/**
 * Who can fill `seat` in `pod`, and how. A Pod Leader moves their own
 * placement into the pod. An ICOMM/QCOMM member already in another pod gets
 * an extra placement (`copy`), since committee members sit on several pods.
 */
export function seatCandidates(
  roster: PodRoster,
  pod: Pick<Pod, 'id'>,
  seat: LeadSeat
): SeatCandidate[] {
  const pods = new Map(roster.pods.map(p => [p.id, p]));
  const describe = (m: PodMember) => {
    const p = m.podId ? pods.get(m.podId) : null;
    return p
      ? `${seatLabel(m.seat, p.program)} · Pod ${p.number}`
      : 'Not in a pod';
  };

  const out: SeatCandidate[] = [];
  for (const rows of byPerson(rosterPlacements(roster))) {
    if (rows.some(r => r.podId === pod.id && r.seat === seat)) continue;
    const inPod = rows.find(r => r.podId === pod.id);
    const free = rows.find(r => r.podId === null);

    let member: PodMember | undefined;
    let copy = false;
    if (seat === 'pm') {
      // Their own placement; skip people only on other pods' committees.
      member = inPod ?? free ?? rows.find(r => r.seat !== 'committee');
    } else {
      member = inPod ?? free;
      if (!member) {
        member = rows.find(r => r.seat === 'committee') ?? rows[0];
        copy = true;
      }
    }
    if (member) {
      out.push({ member, copy, where: rows.map(describe).join(', ') });
    }
  }
  return out.toSorted((a, b) =>
    a.member.person.name.localeCompare(b.member.person.name)
  );
}
