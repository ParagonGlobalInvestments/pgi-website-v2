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
 * Transition phases (simplified — 3 phases, no fadeOut):
 * - idle: No transition in progress
 * - success: Show "Hey [Name]!" message (1200ms)
 * - morphing: Greeting fades, navy panel shrinks 50% → 14rem (500ms)
 * - complete: Transition done, ready for dashboard
 *
 * Total: ~1700ms
 */
export type TransitionPhase = 'idle' | 'success' | 'morphing' | 'complete';

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
   * Simplified: 3 phases, no fadeOut. Total ~1700ms.
   */
  const triggerTransition = useCallback(async (name: string) => {
    setUserName(name);
    setMode('transitioning');

    // Phase 1: Show greeting (1200ms)
    setPhase('success');
    await new Promise(r => setTimeout(r, 1200));

    // Phase 2: Greeting fades + navy panel morphs 50% → 14rem (500ms)
    setPhase('morphing');
    await new Promise(r => setTimeout(r, 500));

    // Phase 3: Done
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
