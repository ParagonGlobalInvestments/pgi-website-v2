/**
 * Portal Transition System — Type Definitions
 *
 * Single discriminated-union state machine replacing:
 * - PortalShellContext (ShellMode + TransitionPhase)
 * - lib/transitions/types.ts (7-phase TransitionPhase)
 * - Header's 5 local boolean states
 */

/** Which transition flow is running */
export type TransitionFlow =
  | 'entrance:login' // Public → Login page (unauthenticated)
  | 'entrance:portal' // Public → Dashboard (authenticated)
  | 'login:morph' // Login → Dashboard (post-OAuth)
  | 'exit:logout' // Dashboard → Public (logout)
  | 'exit:back'; // Dashboard/Login → Public (back to website)

/** Discriminated union of all machine states */
export type MachineState =
  | { _tag: 'idle' }
  | { _tag: 'navy-fill'; flow: TransitionFlow; mobile: boolean }
  | { _tag: 'navy-hold'; flow: TransitionFlow; mobile: boolean }
  | { _tag: 'panel-slide'; flow: TransitionFlow; mobile: boolean }
  | {
      _tag: 'greeting';
      flow: TransitionFlow;
      mobile: boolean;
      userName: string;
    }
  | { _tag: 'morph'; flow: TransitionFlow; mobile: boolean }
  | { _tag: 'compress'; flow: TransitionFlow; mobile: boolean }
  | { _tag: 'expand'; flow: TransitionFlow; mobile: boolean }
  | { _tag: 'complete'; flow: TransitionFlow; mobile: boolean };

/** Shorthand for the _tag field */
export type MachineTag = MachineState['_tag'];

/** Events that drive the state machine */
export type MachineEvent =
  | { type: 'START'; flow: TransitionFlow; mobile: boolean; userName?: string }
  | { type: 'ADVANCE' }
  | { type: 'CANCEL' };

/** Side effects produced by the reducer (executed by context) */
export type MachineEffect =
  | { type: 'SCHEDULE_ADVANCE'; delayMs: number }
  | { type: 'NAVIGATE'; path: string; mode: 'push' | 'href' }
  | { type: 'NONE' };
