'use client';

import { useContext, createContext } from 'react';
import type { TransitionContextValue } from '../types';

/**
 * Context for the transition system.
 * Created here, provided by TransitionProvider.
 */
export const TransitionContext = createContext<TransitionContextValue | null>(
  null
);

/**
 * Hook to access transition state and controls.
 *
 * @example
 * ```tsx
 * const { isTransitioning, phase, navigate } = useTransition();
 *
 * // Check if transitioning
 * if (isTransitioning) {
 *   return <LoadingState />;
 * }
 *
 * // Navigate with automatic transition detection
 * navigate('/portal/login');
 *
 * // Override transition type
 * navigate('/about', { transition: 'instant' });
 * ```
 */
export function useTransition(): TransitionContextValue {
  const context = useContext(TransitionContext);

  if (!context) {
    // Return safe defaults when used outside provider.
    // This enables graceful degradation in tests or isolated components.
    return {
      // State
      isTransitioning: false,
      activeTransition: null,
      phase: 'idle',
      phaseTimeRemaining: 0,
      userName: '',
      queue: [],
      prefersReducedMotion: false,

      // Controls (no-ops)
      navigate: path => {
        // Fallback to native navigation
        if (typeof window !== 'undefined') {
          window.location.href = path;
        }
      },
      enterPortal: async () => {},
      exitPortal: async () => {},
      skipTransition: () => {},
      reset: () => {},
    };
  }

  return context;
}

/**
 * Hook to check if transitions are reduced.
 * Useful for conditionally disabling animations.
 */
export function usePrefersReducedMotion(): boolean {
  const context = useContext(TransitionContext);
  return context?.prefersReducedMotion ?? false;
}
