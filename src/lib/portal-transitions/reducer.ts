/**
 * Portal Transition System — Pure Reducer
 *
 * (state, event) → [newState, effect]
 *
 * Each flow is a linear sequence of phases. ADVANCE walks forward.
 * The reducer is pure — side effects (setTimeout, navigation) are
 * described as data and executed by the context.
 */

import { TIMING } from './config';
import { SITE_URL } from '@/components/portal/constants';
import type {
  MachineState,
  MachineEvent,
  MachineEffect,
  TransitionFlow,
} from './types';

export type ReducerResult = [MachineState, MachineEffect];

/**
 * Phase sequences per flow. Each entry is the next _tag after ADVANCE.
 * The reducer looks up "current tag index → next tag" in this array.
 */
const FLOW_SEQUENCES: Record<TransitionFlow, MachineState['_tag'][]> = {
  'entrance:login': ['navy-fill', 'navy-hold', 'panel-slide', 'complete'],
  'entrance:portal': ['navy-fill', 'compress', 'complete'],
  'login:morph': ['greeting', 'morph', 'complete'],
  'exit:logout': ['expand', 'complete'],
  'exit:back': ['expand', 'complete'],
};

/** Compute the delay (ms) for auto-advancing from a given phase */
function getPhaseDelay(
  tag: MachineState['_tag'],
  flow: TransitionFlow,
  mobile: boolean
): number {
  switch (tag) {
    case 'navy-fill':
      if (flow === 'entrance:login')
        return mobile
          ? TIMING.loginEntry.navyFill.m
          : TIMING.loginEntry.navyFill.d;
      if (flow === 'entrance:portal')
        return mobile ? TIMING.exit.mobile : TIMING.exit.desktop;
      return 400;
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
    default:
      return 0;
  }
}

/** Navigation that fires when entering a specific phase */
function getNavigationForPhase(
  tag: MachineState['_tag'],
  flow: TransitionFlow
): MachineEffect | null {
  // Login entry: navigate after panel-slide starts (desktop) or compress (mobile)
  if (flow === 'entrance:login' && tag === 'complete') {
    return { type: 'NAVIGATE', path: '/portal/login', mode: 'push' };
  }
  // Portal entry: navigate after compress starts
  if (flow === 'entrance:portal' && tag === 'complete') {
    return { type: 'NAVIGATE', path: '/portal?entrance=true', mode: 'href' };
  }
  // Login morph: navigate after morph completes
  if (flow === 'login:morph' && tag === 'complete') {
    return null; // Navigation handled by login page (it knows the redirectTo)
  }
  // Exit flows: navigate after expand
  if (flow === 'exit:logout' && tag === 'complete') {
    return { type: 'NAVIGATE', path: SITE_URL, mode: 'href' };
  }
  if (flow === 'exit:back' && tag === 'complete') {
    return { type: 'NAVIGATE', path: SITE_URL, mode: 'href' };
  }
  return null;
}

/** Build a state with the given tag, inheriting flow/mobile from current */
function makeState(
  tag: MachineState['_tag'],
  base: { flow: TransitionFlow; mobile: boolean; userName?: string }
): MachineState {
  const common = { flow: base.flow, mobile: base.mobile };
  switch (tag) {
    case 'idle':
      return { _tag: 'idle' };
    case 'greeting':
      return { _tag: 'greeting', ...common, userName: base.userName || '' };
    default:
      return { _tag: tag, ...common } as MachineState;
  }
}

export function portalTransitionReducer(
  state: MachineState,
  event: MachineEvent
): ReducerResult {
  switch (event.type) {
    case 'START': {
      // Only start from idle — reject concurrent transitions
      if (state._tag !== 'idle') return [state, { type: 'NONE' }];

      const sequence = FLOW_SEQUENCES[event.flow];
      const firstTag = sequence[0];
      const newState = makeState(firstTag, {
        flow: event.flow,
        mobile: event.mobile,
        userName: event.userName,
      });
      const delay = getPhaseDelay(firstTag, event.flow, event.mobile);
      return [
        newState,
        delay > 0
          ? { type: 'SCHEDULE_ADVANCE', delayMs: delay }
          : { type: 'NONE' },
      ];
    }

    case 'ADVANCE': {
      if (state._tag === 'idle' || state._tag === 'complete')
        return [state, { type: 'NONE' }];

      const flow = (state as Exclude<MachineState, { _tag: 'idle' }>).flow;
      const mobile = (state as Exclude<MachineState, { _tag: 'idle' }>).mobile;
      const userName = state._tag === 'greeting' ? state.userName : undefined;

      const sequence = FLOW_SEQUENCES[flow];
      const currentIndex = sequence.indexOf(state._tag);
      const nextTag = sequence[currentIndex + 1];

      if (!nextTag) return [state, { type: 'NONE' }];

      const newState = makeState(nextTag, { flow, mobile, userName });

      // Check for navigation at this phase
      const nav = getNavigationForPhase(nextTag, flow);
      if (nav) return [newState, nav];

      // Otherwise schedule auto-advance if this phase has a duration
      const delay = getPhaseDelay(nextTag, flow, mobile);
      return [
        newState,
        delay > 0
          ? { type: 'SCHEDULE_ADVANCE', delayMs: delay }
          : { type: 'NONE' },
      ];
    }

    case 'CANCEL': {
      return [{ _tag: 'idle' }, { type: 'NONE' }];
    }

    default:
      return [state, { type: 'NONE' }];
  }
}
