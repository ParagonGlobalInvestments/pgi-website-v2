import {
  canMove,
  isAdminMembership,
  ledPodIds,
  moveLocally,
  nextPodNumber,
  rosterPlacements,
  seatCandidates,
} from './org-chart-rules';
import type { Pod, PodMember, PodRoster, PodSeat, UserProgram } from '@/types';

function member(
  id: string,
  podId: string | null,
  seat: PodSeat,
  userId: string | null = `u-${id}`
): PodMember {
  return { id, podId, userId, seat, person: { id, name: id, school: null } };
}

function pod(
  id: string,
  number: number,
  members: PodMember[],
  program: UserProgram = 'value'
): Pod {
  return { id, program, number, focus: null, members };
}

const admin = { isAdmin: true };
const leader = { isAdmin: false };

describe('isAdminMembership', () => {
  it('matches requireAdmin', () => {
    expect(isAdminMembership({ isAdminAllowlist: true, user: null })).toBe(
      true
    );
    expect(
      isAdminMembership({ isAdminAllowlist: false, user: { role: 'admin' } })
    ).toBe(true);
    // An allowlisted email with a non-admin record is not an admin there.
    expect(
      isAdminMembership({ isAdminAllowlist: true, user: { role: 'analyst' } })
    ).toBe(false);
    expect(isAdminMembership({ isAdminAllowlist: false, user: null })).toBe(
      false
    );
  });
});

describe('ledPodIds', () => {
  it('counts PM and committee seats, not analyst or unassigned', () => {
    const placements = [
      member('a', 'p1', 'pm', 'me'),
      member('b', 'p2', 'committee', 'me'),
      member('c', 'p3', 'analyst', 'me'),
      member('d', null, 'committee', 'me'),
      member('e', 'p4', 'pm', 'someone-else'),
    ];
    expect(Array.from(ledPodIds(placements, 'me')).sort()).toEqual([
      'p1',
      'p2',
    ]);
    expect(ledPodIds(placements, null).size).toBe(0);
  });
});

describe('canMove', () => {
  const led = new Set(['mine']);

  it('lets admins move anyone anywhere but never into a seat with no pod', () => {
    expect(
      canMove(admin, new Set(), member('x', 'p1', 'pm'), {
        podId: 'p2',
        seat: 'committee',
      })
    ).toBe(true);
    expect(
      canMove(admin, new Set(), member('x', 'p1', 'analyst'), {
        podId: null,
        seat: 'pm',
      })
    ).toBe(false);
  });

  it('lets leaders move analysts between their pod and unassigned', () => {
    expect(
      canMove(leader, led, member('x', null, 'analyst'), {
        podId: 'mine',
        seat: 'analyst',
      })
    ).toBe(true);
    expect(
      canMove(leader, led, member('x', 'mine', 'analyst'), {
        podId: null,
        seat: 'analyst',
      })
    ).toBe(true);
    // Unassigned rows count as analysts whatever seat they last held.
    expect(
      canMove(leader, led, member('x', null, 'committee'), {
        podId: 'mine',
        seat: 'analyst',
      })
    ).toBe(true);
  });

  it('stops leaders touching other pods or lead seats', () => {
    const cases: [PodMember, { podId: string | null; seat: PodSeat }][] = [
      [member('x', 'other', 'analyst'), { podId: 'mine', seat: 'analyst' }],
      [member('x', 'mine', 'analyst'), { podId: 'other', seat: 'analyst' }],
      [member('x', null, 'analyst'), { podId: 'other', seat: 'analyst' }],
      [member('x', 'mine', 'analyst'), { podId: 'mine', seat: 'pm' }],
      [member('x', 'mine', 'pm'), { podId: null, seat: 'analyst' }],
      [member('x', 'other', 'analyst'), { podId: 'other', seat: 'analyst' }],
      [member('x', null, 'analyst'), { podId: null, seat: 'analyst' }],
    ];
    for (const [m, target] of cases) {
      expect(canMove(leader, led, m, target)).toBe(false);
    }
  });
});

describe('canMove reordering', () => {
  it('lets leaders reorder their own pod, and admins any list', () => {
    const led = new Set(['mine']);
    const inMine = member('x', 'mine', 'analyst');
    const same = { podId: 'mine', seat: 'analyst' as const };
    expect(canMove(leader, led, inMine, same)).toBe(true);
    expect(
      canMove(admin, new Set(), member('x', null, 'analyst'), {
        podId: null,
        seat: 'analyst',
      })
    ).toBe(true);
  });
});

describe('nextPodNumber', () => {
  it('continues each program and starts quant at 11', () => {
    const pods = [
      { program: 'value' as const, number: 1 },
      { program: 'value' as const, number: 2 },
    ];
    expect(nextPodNumber(pods, 'value')).toBe(3);
    expect(nextPodNumber(pods, 'quant')).toBe(11);
    expect(nextPodNumber([], 'value')).toBe(1);
  });

  it('skips numbers already taken by the other program', () => {
    const pods = [
      { program: 'value' as const, number: 10 },
      { program: 'quant' as const, number: 11 },
    ];
    expect(nextPodNumber(pods, 'value')).toBe(12);
  });
});

describe('moveLocally', () => {
  const roster: PodRoster = {
    pods: [
      pod('p1', 1, [member('lead', 'p1', 'pm'), member('a', 'p1', 'analyst')]),
      pod('p2', 2, [member('b', 'p2', 'analyst')]),
    ],
    unassigned: [member('c', null, 'analyst')],
  };

  it('moves between pods and unassigned', () => {
    const next = moveLocally(roster, 'c', { podId: 'p2', seat: 'analyst' });
    expect(next.unassigned).toEqual([]);
    expect(next.pods[1].members.map(m => m.id)).toEqual(['b', 'c']);

    const out = moveLocally(roster, 'a', { podId: null, seat: 'analyst' });
    expect(out.pods[0].members.map(m => m.id)).toEqual(['lead']);
    expect(out.unassigned.map(m => m.id)).toEqual(['c', 'a']);
  });

  it('inserts at a position, and reorders within a list', () => {
    const into = moveLocally(roster, 'c', { podId: 'p1', seat: 'analyst' }, 0);
    expect(into.pods[0].members.map(m => m.id)).toEqual(['lead', 'c', 'a']);

    const two: PodRoster = {
      pods: [],
      unassigned: ['a', 'b', 'c'].map(id => member(id, null, 'analyst')),
    };
    const reordered = moveLocally(
      two,
      'c',
      { podId: null, seat: 'analyst' },
      0
    );
    expect(reordered.unassigned.map(m => m.id)).toEqual(['c', 'a', 'b']);
    // Out-of-range positions clamp to the end.
    const end = moveLocally(two, 'a', { podId: null, seat: 'analyst' }, 99);
    expect(end.unassigned.map(m => m.id)).toEqual(['b', 'c', 'a']);
  });

  it('drops a placement instead of unassigning someone with another', () => {
    const r: PodRoster = {
      pods: [
        pod('p1', 1, [member('c1', 'p1', 'committee', 'cole')]),
        pod('p2', 2, [member('c2', 'p2', 'committee', 'cole')]),
      ],
      unassigned: [],
    };
    const next = moveLocally(r, 'c1', { podId: null, seat: 'analyst' });
    expect(next.pods[0].members).toEqual([]);
    expect(next.unassigned).toEqual([]);
    expect(next.pods[1].members.map(m => m.id)).toEqual(['c2']);
  });

  it('demotes the current holder when a lead seat is filled', () => {
    const next = moveLocally(roster, 'b', { podId: 'p1', seat: 'pm' });
    const p1 = next.pods[0].members;
    expect(p1.map(m => [m.id, m.seat])).toEqual([
      ['b', 'pm'],
      ['lead', 'analyst'],
      ['a', 'analyst'],
    ]);
    expect(next.pods[1].members).toEqual([]);
  });
});

describe('seatCandidates', () => {
  const roster: PodRoster = {
    pods: [
      pod('p1', 1, [
        member('icomm', 'p1', 'committee', 'u-icomm'),
        member('a', 'p1', 'analyst'),
      ]),
      pod('p2', 2, [member('b', 'p2', 'analyst')]),
    ],
    unassigned: [member('c', null, 'analyst')],
  };

  it('moves people into the PM seat, skipping the committee-only', () => {
    const c = seatCandidates(roster, { id: 'p2' }, 'pm');
    expect(c.map(x => [x.member.id, x.copy])).toEqual([
      ['a', false],
      ['b', false],
      ['c', false],
    ]);
  });

  it('adds a second placement for committee members from other pods', () => {
    const c = seatCandidates(roster, { id: 'p2' }, 'committee');
    const icomm = c.find(x => x.member.id === 'icomm');
    expect(icomm?.copy).toBe(true);
    expect(icomm?.where).toBe('ICOMM · Pod 1');
    // People in the pod or unassigned are moved, not copied.
    expect(c.find(x => x.member.id === 'b')?.copy).toBe(false);
    expect(c.find(x => x.member.id === 'c')?.copy).toBe(false);
  });

  it('leaves out whoever already holds the seat', () => {
    const c = seatCandidates(roster, { id: 'p1' }, 'committee');
    expect(c.some(x => x.member.id === 'icomm')).toBe(false);
  });

  it('groups sheet-name-only placements by name', () => {
    const r: PodRoster = {
      pods: [pod('p1', 1, [member('n1', 'p1', 'committee', null)])],
      unassigned: [],
    };
    expect(rosterPlacements(r)).toHaveLength(1);
    expect(seatCandidates(r, { id: 'p1' }, 'committee')).toEqual([]);
  });
});
