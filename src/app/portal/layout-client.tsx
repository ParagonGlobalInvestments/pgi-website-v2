'use client';

import { MockUserProvider } from '@/contexts/MockUserContext';
import { UnifiedPortalShell } from '@/components/layout/UnifiedPortalShell';

interface PortalLayoutClientProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isPostAuthRedirect?: boolean;
}

/**
 * Client component wrapper that provides:
 * 1. MockUserProvider - admin "View As" mock user context
 * 2. UnifiedPortalShell - morphing layout (login <-> dashboard)
 *
 * PortalTransitionProvider lives at app/layout.tsx (root level)
 * so both Header and portal pages can access it.
 */
export default function PortalLayoutClient({
  children,
  isAuthenticated,
  isPostAuthRedirect = false,
}: PortalLayoutClientProps) {
  const initialMode =
    isAuthenticated && !isPostAuthRedirect ? 'dashboard' : 'login';

  return (
    <MockUserProvider>
      <UnifiedPortalShell initialMode={initialMode}>
        {children}
      </UnifiedPortalShell>
    </MockUserProvider>
  );
}
