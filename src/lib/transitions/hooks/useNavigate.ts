'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from './useTransition';
import { detectTransitionType } from '../types';
import type { TransitionNavigateOptions, TransitionType } from '../types';

/**
 * Hook for navigation with automatic transition detection.
 *
 * This is the primary API for developers. It automatically detects
 * the appropriate transition based on source and destination routes.
 *
 * @example
 * ```tsx
 * const navigate = useTransitionNavigate();
 *
 * // Automatic transition detection
 * navigate('/portal/login');  // public → portal = dramatic
 * navigate('/about');         // public → public = crossfade
 *
 * // Override when needed
 * navigate('/settings', { transition: 'instant' });
 * ```
 */
export function useTransitionNavigate() {
  const router = useRouter();
  const pathname = usePathname();
  const { navigate: transitionNavigate, prefersReducedMotion } =
    useTransition();

  const navigate = useCallback(
    (path: string, options: TransitionNavigateOptions = {}) => {
      // Determine transition type
      let transitionType: TransitionType = options.transition ?? 'crossfade';

      // Auto-detect if not specified
      if (!options.transition) {
        transitionType = detectTransitionType(pathname, path);
      }

      // Respect reduced motion preference
      if (prefersReducedMotion) {
        transitionType = 'instant';
      }

      // For instant/none, just use router directly
      if (transitionType === 'instant' || transitionType === 'none') {
        if (options.replace) {
          router.replace(path, { scroll: options.scroll ?? true });
        } else {
          router.push(path, { scroll: options.scroll ?? true });
        }
        return;
      }

      // Use transition system for animated navigations
      transitionNavigate(path, {
        ...options,
        transition: transitionType,
      });
    },
    [router, pathname, transitionNavigate, prefersReducedMotion]
  );

  return navigate;
}

/**
 * Hook that provides both navigation function and current state.
 *
 * @example
 * ```tsx
 * const { navigate, isTransitioning, phase } = useTransitionNavigation();
 *
 * return (
 *   <button
 *     onClick={() => navigate('/portal')}
 *     disabled={isTransitioning}
 *   >
 *     {isTransitioning ? `Transitioning: ${phase}` : 'Go to Portal'}
 *   </button>
 * );
 * ```
 */
export function useTransitionNavigation() {
  const navigate = useTransitionNavigate();
  const { isTransitioning, phase, activeTransition, queue } = useTransition();

  return {
    navigate,
    isTransitioning,
    phase,
    activeTransition,
    queueLength: queue.length,
  };
}

/**
 * Prebuilt navigation helpers for common routes.
 */
export function usePortalNavigation() {
  const navigate = useTransitionNavigate();
  const { enterPortal, exitPortal } = useTransition();

  return {
    /** Navigate to portal login with signature animation */
    goToLogin: useCallback(() => {
      navigate('/portal/login');
    }, [navigate]),

    /** Navigate to portal dashboard */
    goToDashboard: useCallback(() => {
      navigate('/portal/dashboard');
    }, [navigate]),

    /** Trigger portal enter animation (call after OAuth success) */
    completeLogin: useCallback(
      async (userName?: string) => {
        await enterPortal(userName);
      },
      [enterPortal]
    ),

    /** Navigate back to public site with reverse animation */
    goToWebsite: useCallback(() => {
      exitPortal();
    }, [exitPortal]),

    /** Navigate to specific portal page */
    goToPortalPage: useCallback(
      (page: string) => {
        navigate(`/portal/${page}`, { transition: 'instant' });
      },
      [navigate]
    ),
  };
}
