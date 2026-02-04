'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

/**
 * Shell mode determines the overall layout:
 * - login: 50% navy panel with login form
 * - dashboard: 14rem sidebar with navigation
 * - transitioning: intermediate state during animation
 */
export type ShellMode = 'login' | 'dashboard' | 'transitioning';

/**
 * Transition phases for fine-grained animation control:
 * - idle: No transition in progress
 * - success: Show "Hey [Name]!" message (1200ms - optimized from 2000ms)
 * - fadeOut: Logo + success message fade out (200ms - overlaps with morphing start)
 * - morphing: Navy panel shrinks 50% → 14rem, sidebar content fades in (400ms - optimized)
 * - complete: Transition done, ready for dashboard
 *
 * Total: ~1700ms (optimized from 2900ms, -41%)
 */
export type TransitionPhase =
  | 'idle'
  | 'success'
  | 'fadeOut'
  | 'morphing'
  | 'complete';

interface PortalShellContextType {
  mode: ShellMode;
  phase: TransitionPhase;
  userName: string;
  triggerTransition: (userName: string) => Promise<void>;
  resetToLogin: () => void;
  setMode: (mode: ShellMode) => void;
}

const PortalShellContext = createContext<PortalShellContextType | null>(null);

interface PortalShellProviderProps {
  children: ReactNode;
  initialMode?: ShellMode;
}

export function PortalShellProvider({
  children,
  initialMode = 'login',
}: PortalShellProviderProps) {
  const [mode, setMode] = useState<ShellMode>(initialMode);
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [userName, setUserName] = useState('');

  /**
   * Triggers the login → dashboard transition animation sequence.
   * Returns a promise that resolves when the animation is complete.
   *
   * Optimized timing (total ~1700ms, down from 2900ms):
   * - Success: 1200ms (readable but snappy)
   * - FadeOut: 200ms (quick fade, overlaps with morph start)
   * - Morphing: 400ms (smooth but faster panel resize)
   */
  const triggerTransition = useCallback(async (name: string) => {
    setUserName(name);
    setMode('transitioning');

    // Phase 1: Success message (1200ms - optimized for readability + speed)
    setPhase('success');
    await new Promise(r => setTimeout(r, 1200));

    // Phase 2: Fade out logo + success (200ms - quick transition)
    setPhase('fadeOut');
    await new Promise(r => setTimeout(r, 200));

    // Phase 3: Morph navy panel from 50% to 14rem (400ms - snappy resize)
    setPhase('morphing');
    await new Promise(r => setTimeout(r, 400));

    // Phase 4: Complete
    setPhase('complete');
    setMode('dashboard');
  }, []);

  const resetToLogin = useCallback(() => {
    setMode('login');
    setPhase('idle');
    setUserName('');
  }, []);

  return (
    <PortalShellContext.Provider
      value={{
        mode,
        phase,
        userName,
        triggerTransition,
        resetToLogin,
        setMode,
      }}
    >
      {children}
    </PortalShellContext.Provider>
  );
}

/**
 * Hook to access portal shell state and controls.
 * Returns default values if used outside provider (graceful degradation).
 */
export function usePortalShell(): PortalShellContextType {
  const context = useContext(PortalShellContext);
  if (!context) {
    // Return safe defaults when used outside provider
    return {
      mode: 'login',
      phase: 'idle',
      userName: '',
      triggerTransition: async () => {},
      resetToLogin: () => {},
      setMode: () => {},
    };
  }
  return context;
}
