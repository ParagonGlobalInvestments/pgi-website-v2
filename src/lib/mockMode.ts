import type { UserRole, UserProgram } from '@/types';

/**
 * Admin "View As" mock mode. Either off, or on with the role/program being
 * previewed — there is no role while inactive.
 */
export type MockState =
  | { status: 'inactive' }
  | { status: 'active'; role: UserRole; program: UserProgram | null };

export const INACTIVE_MOCK: MockState = { status: 'inactive' };

const ROLES: readonly UserRole[] = ['admin', 'committee', 'pm', 'analyst'];
const PROGRAMS: readonly UserProgram[] = ['value', 'quant'];

function isRole(value: unknown): value is UserRole {
  return ROLES.includes(value as UserRole);
}

function isProgram(value: unknown): value is UserProgram {
  return PROGRAMS.includes(value as UserProgram);
}

/**
 * Parse a stored mock state. Accepts the current `{ status: 'active', … }`
 * shape and the legacy `{ isActive: true, role, program }` shape.
 */
export function parseStoredMock(raw: unknown): MockState {
  if (!raw || typeof raw !== 'object') return INACTIVE_MOCK;
  const value = raw as Record<string, unknown>;
  const active = value.status === 'active' || value.isActive === true;
  if (!active || !isRole(value.role)) return INACTIVE_MOCK;
  return {
    status: 'active',
    role: value.role,
    program: isProgram(value.program) ? value.program : null,
  };
}

/**
 * Shape written to localStorage for an active mock. Also includes the legacy
 * `isActive` flag so an older deploy still reads it after a rollback.
 */
export function toStoredMock(
  state: Extract<MockState, { status: 'active' }>
): Record<string, unknown> {
  return { ...state, isActive: true };
}
