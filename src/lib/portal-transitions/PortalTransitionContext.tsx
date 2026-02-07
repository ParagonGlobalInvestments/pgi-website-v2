'use client';

/**
 * Portal Transition System — React Context
 *
 * Wraps the pure reducer with effect execution (setTimeout, navigation).
 * Mount once in app/layout.tsx — accessible from Header, Portal, everywhere.
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { portalTransitionReducer } from './reducer';
import type {
  MachineState,
  MachineTag,
  MachineEffect,
  TransitionFlow,
} from './types';

interface PortalTransitionContextValue {
  tag: MachineTag;
  state: MachineState;
  isActive: boolean;
  flow: TransitionFlow | null;
  mobile: boolean;
  userName: string;
  start: (
    flow: TransitionFlow,
    opts?: { mobile?: boolean; userName?: string }
  ) => void;
  advance: () => void;
  cancel: () => void;
}

const PortalTransitionCtx = createContext<PortalTransitionContextValue | null>(
  null
);

const INITIAL_STATE: MachineState = { _tag: 'idle' };

export function PortalTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // We use a ref to execute effects after dispatch
  const pendingEffectRef = useRef<MachineEffect | null>(null);
  const [state, rawDispatch] = useReducer(
    (s: MachineState, e: Parameters<typeof portalTransitionReducer>[1]) => {
      const [newState, effect] = portalTransitionReducer(s, e);
      pendingEffectRef.current = effect;
      return newState;
    },
    INITIAL_STATE
  );

  // Ref mirror of state so start() can check without re-creating the callback
  const stateRef = useRef(state);
  stateRef.current = state;

  // Execute side effects after state update
  useEffect(() => {
    const effect = pendingEffectRef.current;
    if (!effect || effect.type === 'NONE') return;
    pendingEffectRef.current = null;

    if (effect.type === 'SCHEDULE_ADVANCE') {
      // Clear any pending timer first
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        rawDispatch({ type: 'ADVANCE' });
      }, effect.delayMs);
    } else if (effect.type === 'NAVIGATE') {
      if (effect.mode === 'push') {
        router.push(effect.path);
      } else {
        window.location.href = effect.path;
      }
    }
  });

  // Cleanup on unmount
  useEffect(() => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

  const start = useCallback(
    (flow: TransitionFlow, opts?: { mobile?: boolean; userName?: string }) => {
      // Only clear timers if we're idle — otherwise the reducer rejects START
      // and we'd kill an in-flight timer (StrictMode double-invoke bug)
      if (stateRef.current._tag !== 'idle') return;
      if (timerRef.current) clearTimeout(timerRef.current);
      rawDispatch({
        type: 'START',
        flow,
        mobile: opts?.mobile ?? false,
        userName: opts?.userName,
      });
    },
    []
  );

  const advance = useCallback(() => {
    rawDispatch({ type: 'ADVANCE' });
  }, []);

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    rawDispatch({ type: 'CANCEL' });
  }, []);

  // Derived values
  const isIdle = state._tag === 'idle';
  const flow = isIdle
    ? null
    : (state as Exclude<MachineState, { _tag: 'idle' }>).flow;
  const mobile = isIdle
    ? false
    : (state as Exclude<MachineState, { _tag: 'idle' }>).mobile;
  const userName = state._tag === 'greeting' ? state.userName : '';

  const value: PortalTransitionContextValue = {
    tag: state._tag,
    state,
    isActive: !isIdle,
    flow,
    mobile,
    userName,
    start,
    advance,
    cancel,
  };

  return (
    <PortalTransitionCtx.Provider value={value}>
      {children}
    </PortalTransitionCtx.Provider>
  );
}

/**
 * Hook to access portal transition state and controls.
 * Returns safe defaults when used outside provider (SSR, non-portal pages).
 */
export function usePortalTransition(): PortalTransitionContextValue {
  const ctx = useContext(PortalTransitionCtx);
  if (!ctx) {
    return {
      tag: 'idle',
      state: { _tag: 'idle' },
      isActive: false,
      flow: null,
      mobile: false,
      userName: '',
      start: () => {},
      advance: () => {},
      cancel: () => {},
    };
  }
  return ctx;
}
