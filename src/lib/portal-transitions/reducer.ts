/**
 * Portal Transition System — Pure Reducer
 *
 * (state, event) → [newState, effect]
 *
 * Each flow is a linear sequence of phases. ADVANCE walks forward.
 * The reducer is pure — side effects (setTimeout, navigation) are
 * described as data and executed by the context.
 *
 * Lifecycle: idle → phase… → complete. `complete` is terminal for the flow
 * but settled: a new START is accepted from it. Flows that navigate with
 * router.push return to idle on the next ROUTE_CHANGED (their destination
 * has rendered); flows that navigate with a full page load end with the
 * document, and CANCEL resets a page restored from the back/forward cache.
 */

import { TIMING } from './config';
import { SITE_URL } from '@/components/portal/constants';
import type {
  MachineState,
  MachineEvent,
  MachineEffect,
  MachineTag,
  TransitionFlow,
} from './types';

export type ReducerResult = [MachineState, MachineEffect];

type PhaseTag = Exclude<MachineTag, 'idle'>;

/**
 * Phase sequences per flow. Phases whose duration is 0 for the current
 * device are skipped (see getSequence), so every phase that is entered
 * schedules its own ADVANCE.
 */
const FLOW_SEQUENCES: Record<TransitionFlow, PhaseTag[]> = {
  'entrance:login': ['navy-fill', 'navy-hold', 'panel-slide', 'complete'],
  'entrance:portal': ['compress', 'complete'],
  'login:morph': ['greeting', 'morph', 'complete'],
  'exit:logout': ['expand', 'complete'],
  'exit:back': ['expand', 'complete'],
};

/** Navigation fired when a flow reaches `complete` (null: caller navigates) */
const FLOW_NAVIGATION: Record<
  TransitionFlow,
  Extract<MachineEffect, { type: 'NAVIGATE' }> | null
> = {
  'entrance:login': { type: 'NAVIGATE', path: '/portal/login', mode: 'push' },
  'entrance:portal': {
    type: 'NAVIGATE',
    path: '/portal?entrance=true',
    mode: 'href',
  },
  // The login page navigates itself — it knows the redirectTo target
  'login:morph': null,
  'exit:logout': { type: 'NAVIGATE', path: SITE_URL, mode: 'href' },
  'exit:back': { type: 'NAVIGATE', path: SITE_URL, mode: 'href' },
};

/** Duration (ms) of a phase before it auto-advances; 0 means "skip it" */
export function getPhaseDelay(tag: PhaseTag, mobile: boolean): number {
  switch (tag) {
    case 'navy-fill':
      return mobile
        ? TIMING.loginEntry.navyFill.m
        : TIMING.loginEntry.navyFill.d;
    case 'navy-hold':
      return mobile ? TIMING.loginEntry.hold.m : TIMING.loginEntry.hold.d;
    case 'panel-slide':
      return mobile
        ? TIMING.loginEntry.panelSlide.m
        : TIMING.loginEntry.panelSlide.d;
    case 'greeting':
      return TIMING.greeting;
    case 'morph':
      return TIMING.morph;
    case 'compress':
      return mobile ? TIMING.portalEntry.mobile : TIMING.portalEntry.desktop;
    case 'expand':
      return mobile ? TIMING.exit.mobile : TIMING.exit.desktop;
    case 'complete':
      return 0;
    default: {
      const unreachable: never = tag;
      return unreachable;
    }
  }
}

/** The phases a flow walks through on this device (zero-length phases dropped) */
export function getSequence(flow: TransitionFlow, mobile: boolean): PhaseTag[] {
  return FLOW_SEQUENCES[flow].filter(
    tag => tag === 'complete' || getPhaseDelay(tag, mobile) > 0
  );
}

/** Whether a new flow may start from this state */
export function canStart(state: MachineState): boolean {
  return state._tag === 'idle' || state._tag === 'complete';
}

/** Build a state with the given tag */
function makeState(
  tag: PhaseTag,
  base: { flow: TransitionFlow; mobile: boolean; userName?: string }
): MachineState {
  const common = { flow: base.flow, mobile: base.mobile };
  if (tag === 'greeting') {
    return { _tag: 'greeting', ...common, userName: base.userName || '' };
  }
  return { _tag: tag, ...common };
}

/** Enter a phase: the new state plus the effect that entering it triggers */
function enter(
  tag: PhaseTag,
  base: { flow: TransitionFlow; mobile: boolean; userName?: string }
): ReducerResult {
  const state = makeState(tag, base);
  if (tag === 'complete') {
    return [state, FLOW_NAVIGATION[base.flow] ?? { type: 'NONE' }];
  }
  return [
    state,
    {
      type: 'SCHEDULE_ADVANCE',
      delayMs: getPhaseDelay(tag, base.mobile),
    },
  ];
}

export function portalTransitionReducer(
  state: MachineState,
  event: MachineEvent
): ReducerResult {
  switch (event.type) {
    case 'START': {
      // Reject concurrent transitions (and StrictMode double-invokes)
      if (!canStart(state)) return [state, { type: 'NONE' }];
      const [first] = getSequence(event.flow, event.mobile);
      return enter(first, {
        flow: event.flow,
        mobile: event.mobile,
        userName: event.userName,
      });
    }

    case 'ADVANCE': {
      if (state._tag === 'idle' || state._tag === 'complete')
        return [state, { type: 'NONE' }];

      const { flow, mobile } = state;
      const userName = state._tag === 'greeting' ? state.userName : undefined;
      const sequence = getSequence(flow, mobile);
      const nextTag = sequence[sequence.indexOf(state._tag) + 1];
      if (!nextTag) return [state, { type: 'NONE' }];
      return enter(nextTag, { flow, mobile, userName });
    }

    case 'ROUTE_CHANGED': {
      // A router.push flow has landed: its destination owns the screen now
      if (
        state._tag === 'complete' &&
        FLOW_NAVIGATION[state.flow]?.mode === 'push'
      ) {
        return [{ _tag: 'idle' }, { type: 'NONE' }];
      }
      return [state, { type: 'NONE' }];
    }

    case 'CANCEL':
      return [{ _tag: 'idle' }, { type: 'NONE' }];

    default:
      return [state, { type: 'NONE' }];
  }
}
