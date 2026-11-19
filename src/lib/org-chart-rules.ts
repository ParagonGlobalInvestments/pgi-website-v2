/**
 * Org chart editing rules, shared by the API (enforcement) and the editor UI
 * (which only offers what the API will accept).
 *
 * - Admins can move anyone anywhere, fill lead seats, and manage pods.
 * - Pod leaders (the PM, or the ICOMM/QCOMM member) can move analysts between
 *   the pods they lead and "Not in a pod yet", and reorder their pods'
 *   analysts. They can't touch lead seats.
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

/**
 * The viewer as an admin previewing the portal as `mockRole` ("View As")
 * would be: a non-admin role drops admin powers, and an analyst leads no
 * pods. Display only; the API still checks the real session.
 */
export function mockedViewer(
  viewer: OrgChartViewer,
  mockRole: UserRole | null
): OrgChartViewer {
  if (!viewer.isAdmin || !mockRole || mockRole === 'admin') return viewer;
  return {
    isAdmin: false,
    userId: mockRole === 'analyst' ? null : viewer.userId,
  };
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
  // Reordering within a list: leaders can reorder their own pods.
  if (member.podId === target.podId) {
    return target.podId !== null && led.has(target.podId);
  }

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

/** A pod's lead seats: the program's, plus any odd one already filled. */
export function podLeadSeats(
  pod: Pick<Pod, 'program' | 'members'>
): LeadSeat[] {
  return Array.from(
    new Set([
      ...LEAD_SEATS[pod.program],
      ...pod.members.map(m => m.seat).filter(isLeadSeat),
    ])
  );
}

/**
 * Apply a move to a local copy of the roster, for an instant response to a
 * drop. `index` is the position among the target pod's analysts (or the
 * people not in a pod); it defaults to the end. The API's answer replaces
 * this, so a displaced lead-seat holder is simply shown as an analyst here.
 */
export function moveLocally(
  roster: PodRoster,
  memberId: string,
  target: MoveTarget,
  index?: number
): PodRoster {
  const member = rosterPlacements(roster).find(m => m.id === memberId);
  if (!member) return roster;

  const moved: PodMember = {
    ...member,
    podId: target.podId,
    seat: target.podId === null ? 'analyst' : target.seat,
  };
  const insert = (list: PodMember[]) => {
    const at =
      index === undefined
        ? list.length
        : Math.max(0, Math.min(index, list.length));
    return [...list.slice(0, at), moved, ...list.slice(at)];
  };
  const demote = (m: PodMember): PodMember =>
    isLeadSeat(moved.seat) && m.seat === moved.seat
      ? { ...m, seat: 'analyst' }
      : m;

  const pods = roster.pods.map(pod => {
    const rest = pod.members.filter(m => m.id !== memberId);
    if (pod.id !== target.podId) return { ...pod, members: rest };
    const others = rest.map(demote);
    const leads = others.filter(m => isLeadSeat(m.seat));
    const analysts = others.filter(m => m.seat === 'analyst');
    const members = isLeadSeat(moved.seat)
      ? [...leads, moved]
          .toSorted(
            (a, b) =>
              (a.seat === 'committee' ? 0 : 1) -
              (b.seat === 'committee' ? 0 : 1)
          )
          .concat(analysts)
      : [...leads, ...insert(analysts)];
    return { ...pod, members };
  });
  const rest = roster.unassigned.filter(m => m.id !== memberId);
  // Like the server: someone with another placement just leaves the pod
  // instead of also showing as "Not in a pod yet".
  const elsewhere = rosterPlacements(roster).some(
    m => m.id !== memberId && samePerson(m, member)
  );
  const unassigned = target.podId === null && !elsewhere ? insert(rest) : rest;

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

/** Same person: same user, or (no user record) same sheet name. */
export function samePerson(
  a: Pick<PodMember, 'userId' | 'person'>,
  b: Pick<PodMember, 'userId' | 'person'>
): boolean {
  return b.userId
    ? a.userId === b.userId
    : !a.userId && a.person.name === b.person.name;
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
