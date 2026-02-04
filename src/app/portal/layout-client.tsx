'use client';

import { PortalShellProvider } from '@/contexts/PortalShellContext';
import { UnifiedPortalShell } from '@/components/layout/UnifiedPortalShell';

interface PortalLayoutClientProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

/**
 * Client component wrapper that provides:
 * 1. PortalShellProvider - shared animation state context
 * 2. UnifiedPortalShell - morphing layout (login ↔ dashboard)
 *
 * The shell mode is determined by:
 * - isAuthenticated prop from server (initial state)
 * - Current pathname (login route vs dashboard)
 * - Transition state during animations
 */
export default function PortalLayoutClient({
  children,
  isAuthenticated,
}: PortalLayoutClientProps) {
  return (
    <PortalShellProvider initialMode={isAuthenticated ? 'dashboard' : 'login'}>
      <UnifiedPortalShell>{children}</UnifiedPortalShell>
    </PortalShellProvider>
  );
}
