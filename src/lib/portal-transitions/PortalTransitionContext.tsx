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
import { usePathname, useRouter } from 'next/navigation';
import { canStart, portalTransitionReducer } from './reducer';
import type {
  MachineState,
  MachineTag,
  MachineEffect,
  MachineEvent,
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
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Effects produced by the reducer, keyed by the event that produced them
  // (StrictMode runs reducers twice per event; the Map keeps one effect each)
  const pendingEffectsRef = useRef(new Map<MachineEvent, MachineEffect>());
  const [state, rawDispatch] = useReducer(
    (s: MachineState, e: MachineEvent) => {
      const [newState, effect] = portalTransitionReducer(s, e);
      if (effect.type !== 'NONE') pendingEffectsRef.current.set(e, effect);
      return newState;
    },
    INITIAL_STATE
  );

  // Ref mirror of state so start() can check without re-creating the callback
  const stateRef = useRef(state);
  stateRef.current = state;

  // Execute side effects after state update
  useEffect(() => {
    const effects = Array.from(pendingEffectsRef.current.values());
    if (effects.length === 0) return;
    pendingEffectsRef.current.clear();

    for (const effect of effects) {
      if (effect.type === 'SCHEDULE_ADVANCE') {
        // Only one phase timer runs at a time
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          rawDispatch({ type: 'ADVANCE' });
        }, effect.delayMs);
      } else if (effect.type === 'NAVIGATE') {
        if (effect.mode === 'push') {
          router.push(effect.path);
        } else {
          window.location.href = effect.path;
        }
      }
    }
  });

  // Route changes let a router.push flow settle back to idle
  useEffect(() => {
    rawDispatch({ type: 'ROUTE_CHANGED' });
  }, [pathname]);

  // A page restored from the back/forward cache must not keep a frozen overlay
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      rawDispatch({ type: 'CANCEL' });
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const start = useCallback(
    (flow: TransitionFlow, opts?: { mobile?: boolean; userName?: string }) => {
      // Check before clearing timers: if the reducer would reject START we
      // must not kill an in-flight timer (StrictMode double-invoke bug)
      if (!canStart(stateRef.current)) return;
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
