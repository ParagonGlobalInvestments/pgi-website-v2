'use client';

/**
 * Shared exit hook — replaces 3 duplicated exit implementations:
 * 1. UnifiedPortalShell handleBackToWebsite
 * 2. login/page.tsx useExitTransition
 * 3. logout/page.tsx inline setTimeout
 *
 * Snapshots isMobile at click time to prevent orientation changes mid-animation.
 */

import { useState, useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePortalTransition } from './PortalTransitionContext';

export function usePortalExit() {
  const isMobile = useIsMobile();
  const { start, tag, mobile } = usePortalTransition();
  // Track whether we initiated an exit (for overlay rendering)
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      const snapshotMobile = isMobile;
      setIsExiting(true);
      start('exit:back', { mobile: snapshotMobile });
    },
    [isMobile, start]
  );

  return {
    isExiting: isExiting || tag === 'expand',
    exitMobile: isExiting ? mobile : isMobile,
    handleExit,
  };
}
