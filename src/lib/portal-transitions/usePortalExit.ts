'use client';

/**
 * Shared "back to website" exit: starts the exit:back flow.
 *
 * Snapshots isMobile at click time to prevent orientation changes mid-animation.
 * Whether an exit is running is read from the machine (flow/tag), not here.
 */

import { useCallback } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePortalTransition } from './PortalTransitionContext';

export function usePortalExit() {
  const isMobile = useIsMobile();
  const { start } = usePortalTransition();

  const handleExit = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      start('exit:back', { mobile: isMobile });
    },
    [isMobile, start]
  );

  return { handleExit };
}
