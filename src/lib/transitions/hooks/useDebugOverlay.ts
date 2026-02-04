'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEBUG_SHORTCUT } from '../config';

/**
 * Hook to manage the debug overlay visibility.
 * Only active in development environment.
 *
 * Toggle with Ctrl+Shift+T (configurable in config.ts).
 *
 * @example
 * ```tsx
 * const { isVisible, toggle } = useDebugOverlay();
 *
 * return (
 *   <>
 *     <button onClick={toggle}>Toggle Debug</button>
 *     {isVisible && <DebugOverlay />}
 *   </>
 * );
 * ```
 */
export function useDebugOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  const toggle = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    // Only in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if all modifiers are pressed
      const modifiersMatch = DEBUG_SHORTCUT.modifiers.every(
        modifier => event[modifier]
      );

      if (modifiersMatch && event.code === DEBUG_SHORTCUT.key) {
        event.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return {
    /** Whether overlay is currently visible */
    isVisible,

    /** Toggle overlay visibility */
    toggle,

    /** Show overlay */
    show,

    /** Hide overlay */
    hide,

    /** Is debug mode available (development only) */
    isAvailable: process.env.NODE_ENV === 'development',
  };
}

/**
 * Hook for performance timing during transitions.
 * Tracks phase durations for debugging.
 */
export function useTransitionTiming() {
  const [timings, setTimings] = useState<Record<string, number>>({});
  const [startTime, setStartTime] = useState<number | null>(null);

  const startPhase = useCallback((phase: string) => {
    const now = performance.now();
    setStartTime(now);

    setTimings(prev => ({
      ...prev,
      [`${phase}_start`]: now,
    }));
  }, []);

  const endPhase = useCallback(
    (phase: string) => {
      const now = performance.now();
      if (startTime !== null) {
        const duration = now - startTime;
        setTimings(prev => ({
          ...prev,
          [`${phase}_end`]: now,
          [`${phase}_duration`]: duration,
        }));
      }
      setStartTime(null);
    },
    [startTime]
  );

  const reset = useCallback(() => {
    setTimings({});
    setStartTime(null);
  }, []);

  const getTotalDuration = useCallback(() => {
    const durations = Object.entries(timings)
      .filter(([key]) => key.endsWith('_duration'))
      .map(([, value]) => value);

    return durations.reduce((sum, d) => sum + d, 0);
  }, [timings]);

  return {
    timings,
    startPhase,
    endPhase,
    reset,
    getTotalDuration,
  };
}
