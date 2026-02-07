'use client';

import { useMockUser } from '@/contexts/MockUserContext';
import { usePortalUser } from '@/hooks/usePortalUser';
import { ROLE_LABELS, PROGRAM_LABELS } from '@/components/portal/constants';

/**
 * Sticky amber banner shown when admin has mock mode active.
 * Renders in the shell above {children} so it appears even on "Not authorized" pages.
 */
export function MockModeIndicator() {
  const { mock, stopMock } = useMockUser();
  const { realUser } = usePortalUser();

  // Only render for real admins with active mock
  if (!mock.isActive || realUser?.role !== 'admin') return null;

  const roleLabel = ROLE_LABELS[mock.role] || mock.role;
  const programLabel = mock.program
    ? PROGRAM_LABELS[mock.program] || mock.program
    : null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-sm">
      <span className="text-amber-800">
        Viewing as <strong>{roleLabel}</strong>
        {programLabel && (
          <>
            <span className="mx-1.5 text-amber-400">·</span>
            {programLabel}
          </>
        )}
      </span>
      <button
        type="button"
        onClick={stopMock}
        className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
      >
        Exit Mock Mode
      </button>
    </div>
  );
}
