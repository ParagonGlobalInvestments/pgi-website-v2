'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Transition phases for the multi-step animation
export type TransitionPhase =
  | 'idle' // Not transitioning
  | 'success' // Show success message (logo visible, success on right)
  | 'fadeOut' // Logo + success fade out
  | 'shrink' // Navy panel shrinks to sidebar
  | 'complete'; // Ready to redirect

interface AuthTransitionContextType {
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  phase: TransitionPhase;
  setPhase: (phase: TransitionPhase) => void;
  userName: string;
  setUserName: (name: string) => void;
}

const AuthTransitionContext = createContext<AuthTransitionContextType | null>(
  null
);

export function AuthTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [userName, setUserName] = useState('');

  return (
    <AuthTransitionContext.Provider
      value={{
        isTransitioning,
        setIsTransitioning,
        phase,
        setPhase,
        userName,
        setUserName,
      }}
    >
      {children}
    </AuthTransitionContext.Provider>
  );
}

export function useAuthTransition() {
  const context = useContext(AuthTransitionContext);
  if (!context) {
    return {
      isTransitioning: false,
      setIsTransitioning: () => {},
      phase: 'idle' as TransitionPhase,
      setPhase: () => {},
      userName: '',
      setUserName: () => {},
    };
  }
  return context;
}
