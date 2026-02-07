'use client';

import { PortalShellProvider } from '@/contexts/PortalShellContext';
import { MockUserProvider } from '@/contexts/MockUserContext';
import { UnifiedPortalShell } from '@/components/layout/UnifiedPortalShell';

interface PortalLayoutClientProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isPostAuthRedirect?: boolean;
}

/**
 * Client component wrapper that provides:
 * 1. PortalShellProvider - shared animation state context
 * 2. MockUserProvider - admin "View As" mock user context
 * 3. UnifiedPortalShell - morphing layout (login ↔ dashboard)
 *
 * The shell mode is determined by:
 * - isAuthenticated prop from server (initial state)
 * - isPostAuthRedirect - if true, start in login mode for animation even if authenticated
 * - Transition state during animations
 */
export default function PortalLayoutClient({
  children,
  isAuthenticated,
  isPostAuthRedirect = false,
}: PortalLayoutClientProps) {
  // For post-auth redirects, start in login mode so animation can play
  // The login page will trigger the transition to dashboard
  const initialMode =
    isAuthenticated && !isPostAuthRedirect ? 'dashboard' : 'login';

  return (
    <MockUserProvider>
      <PortalShellProvider initialMode={initialMode}>
        <UnifiedPortalShell>{children}</UnifiedPortalShell>
      </PortalShellProvider>
    </MockUserProvider>
  );
}
