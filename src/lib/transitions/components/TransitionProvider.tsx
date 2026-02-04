'use client';

import { useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TransitionContext } from '../hooks/useTransition';
import {
  LOGIN_TRANSITION,
  LOGOUT_TRANSITION,
  PUBLIC_TRANSITION,
} from '../config';
import type {
  TransitionPhase,
  TransitionType,
  TransitionContextValue,
  TransitionNavigateOptions,
  QueuedNavigation,
} from '../types';
import { detectTransitionType } from '../types';

interface TransitionProviderProps {
  children: ReactNode;
}

/**
 * Root provider for the unified transition system.
 *
 * Wraps the entire application to enable smooth, coordinated transitions
 * between public pages and the portal.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <TransitionProvider>
 *   <Header />
 *   {children}
 *   <Footer />
 * </TransitionProvider>
 * ```
 */
export function TransitionProvider({ children }: TransitionProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Core state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeTransition, setActiveTransition] =
    useState<TransitionType | null>(null);
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);
  const [userName, setUserName] = useState('');
  const [queue, setQueue] = useState<QueuedNavigation[]>([]);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  /**
   * Process the navigation queue.
   * Called when a transition completes or when queue is modified.
   */
  const processQueue = useCallback(() => {
    if (isTransitioning || queue.length === 0) return;

    const next = queue[0];
    setQueue(prev => prev.slice(1));

    // Execute the queued navigation
    const transitionType =
      next.options.transition ?? detectTransitionType(pathname, next.path);

    if (
      transitionType === 'instant' ||
      transitionType === 'none' ||
      prefersReducedMotion
    ) {
      if (next.options.replace) {
        router.replace(next.path);
      } else {
        router.push(next.path);
      }
    } else {
      // Re-trigger with the stored options
      executeTransition(next.path, next.options);
    }
  }, [isTransitioning, queue, pathname, router, prefersReducedMotion]);

  /**
   * Execute a transition sequence.
   */
  const executeTransition = useCallback(
    async (path: string, options: TransitionNavigateOptions) => {
      const transitionType =
        options.transition ?? detectTransitionType(pathname, path);

      // For reduced motion or instant transitions
      if (
        prefersReducedMotion ||
        transitionType === 'instant' ||
        transitionType === 'none'
      ) {
        if (options.replace) {
          router.replace(path);
        } else {
          router.push(path);
        }
        return;
      }

      setIsTransitioning(true);
      setActiveTransition(transitionType);

      if (options.userName) {
        setUserName(options.userName);
      }

      try {
        switch (transitionType) {
          case 'portal-enter':
            await runPortalEnterSequence(path, options);
            break;

          case 'portal-exit':
            await runPortalExitSequence(path, options);
            break;

          case 'crossfade':
          default:
            await runCrossfadeSequence(path, options);
            break;
        }
      } finally {
        setIsTransitioning(false);
        setActiveTransition(null);
        setPhase('idle');
        setUserName('');

        // Process any queued navigations
        processQueue();
      }
    },
    [pathname, router, prefersReducedMotion, processQueue]
  );

  /**
   * Portal enter sequence: public → portal login.
   * The signature "fade to navy, slide in panel" animation.
   */
  const runPortalEnterSequence = useCallback(
    async (path: string, options: TransitionNavigateOptions) => {
      // Phase 1: Content exit
      setPhase('content-exit');
      setPhaseTimeRemaining(LOGIN_TRANSITION.contentExit);
      await sleep(LOGIN_TRANSITION.contentExit);

      // Phase 2: Navy hold
      setPhase('navy-hold');
      setPhaseTimeRemaining(LOGIN_TRANSITION.navyHold);
      await sleep(LOGIN_TRANSITION.navyHold);

      // Navigate while in navy hold
      if (options.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }

      // Phase 3: Panel slide (handled by portal layout)
      setPhase('panel-slide');
      setPhaseTimeRemaining(LOGIN_TRANSITION.panelSlide);
      await sleep(LOGIN_TRANSITION.panelSlide);

      // Phase 4: Content enter
      setPhase('content-enter');
      setPhaseTimeRemaining(LOGIN_TRANSITION.contentEnter);
      await sleep(LOGIN_TRANSITION.contentEnter);

      setPhase('complete');
    },
    [router]
  );

  /**
   * Portal exit sequence: portal → public.
   * Reverse animation, but snappier.
   */
  const runPortalExitSequence = useCallback(
    async (path: string, options: TransitionNavigateOptions) => {
      // Phase 1: Content exit
      setPhase('content-exit');
      setPhaseTimeRemaining(LOGOUT_TRANSITION.contentExit);
      await sleep(LOGOUT_TRANSITION.contentExit);

      // Phase 2: Panel retreat
      setPhase('panel-slide');
      setPhaseTimeRemaining(LOGOUT_TRANSITION.panelRetreat);
      await sleep(LOGOUT_TRANSITION.panelRetreat);

      // Navigate during navy expansion
      if (options.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }

      // Phase 3: Navy to public
      setPhase('content-enter');
      setPhaseTimeRemaining(
        LOGOUT_TRANSITION.navyToPublic + LOGOUT_TRANSITION.headerEnter
      );
      await sleep(
        LOGOUT_TRANSITION.navyToPublic + LOGOUT_TRANSITION.headerEnter
      );

      setPhase('complete');
    },
    [router]
  );

  /**
   * Crossfade sequence: public ↔ public pages.
   * Simple fade out, navigate, fade in.
   */
  const runCrossfadeSequence = useCallback(
    async (path: string, options: TransitionNavigateOptions) => {
      // Fade out
      setPhase('content-exit');
      setPhaseTimeRemaining(PUBLIC_TRANSITION.fadeOut);
      await sleep(PUBLIC_TRANSITION.fadeOut);

      // Navigate
      if (options.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }

      // Fade in
      setPhase('content-enter');
      setPhaseTimeRemaining(PUBLIC_TRANSITION.fadeIn);
      await sleep(PUBLIC_TRANSITION.fadeIn);

      setPhase('complete');
    },
    [router]
  );

  /**
   * Navigate with transition.
   * Queues navigation if another transition is in progress.
   */
  const navigate = useCallback(
    (path: string, options: TransitionNavigateOptions = {}) => {
      // If currently transitioning, queue this navigation
      if (isTransitioning) {
        setQueue(prev => [...prev, { path, options, timestamp: Date.now() }]);
        return;
      }

      executeTransition(path, options);
    },
    [isTransitioning, executeTransition]
  );

  /**
   * Enter portal with optional greeting.
   * Called after OAuth success.
   */
  const enterPortal = useCallback(async (name?: string) => {
    setIsTransitioning(true);
    setActiveTransition('portal-enter');

    if (name) {
      setUserName(name);
      // Show greeting
      setPhase('greeting');
      await sleep(LOGIN_TRANSITION.greeting);
    }

    setIsTransitioning(false);
    setActiveTransition(null);
    setPhase('complete');
  }, []);

  /**
   * Exit portal to public site.
   */
  const exitPortal = useCallback(async () => {
    await navigate('/', { transition: 'portal-exit' });
  }, [navigate]);

  /**
   * Skip current transition (emergency exit).
   */
  const skipTransition = useCallback(() => {
    setIsTransitioning(false);
    setActiveTransition(null);
    setPhase('complete');
    setUserName('');
    // Clear queue
    setQueue([]);
  }, []);

  /**
   * Reset to idle state.
   */
  const reset = useCallback(() => {
    setIsTransitioning(false);
    setActiveTransition(null);
    setPhase('idle');
    setPhaseTimeRemaining(0);
    setUserName('');
    setQueue([]);
  }, []);

  // Context value
  const value: TransitionContextValue = useMemo(
    () => ({
      // State
      isTransitioning,
      activeTransition,
      phase,
      phaseTimeRemaining,
      userName,
      queue,
      prefersReducedMotion,

      // Controls
      navigate,
      enterPortal,
      exitPortal,
      skipTransition,
      reset,
    }),
    [
      isTransitioning,
      activeTransition,
      phase,
      phaseTimeRemaining,
      userName,
      queue,
      prefersReducedMotion,
      navigate,
      enterPortal,
      exitPortal,
      skipTransition,
      reset,
    ]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

/**
 * Helper to sleep for a specified duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
