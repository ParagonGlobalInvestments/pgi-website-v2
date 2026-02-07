/**
 * Portal Transition System — Barrel Exports
 */

// Config
export { EASING, TIMING, LAYOUT, NAVY, NAVY_COLORS } from './config';

// Types
export type {
  TransitionFlow,
  MachineState,
  MachineTag,
  MachineEvent,
  MachineEffect,
} from './types';

// Context + hooks
export {
  PortalTransitionProvider,
  usePortalTransition,
} from './PortalTransitionContext';
export { usePortalExit } from './usePortalExit';

// Overlay component
export { NavyOverlay } from './NavyOverlay';
