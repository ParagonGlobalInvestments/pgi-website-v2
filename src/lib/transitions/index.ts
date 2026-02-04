/**
 * Unified Transition System
 *
 * A comprehensive animation system for smooth, cinematic transitions
 * across the entire website.
 *
 * @example Basic Usage
 * ```tsx
 * // In app/layout.tsx
 * import { TransitionProvider } from '@/lib/transitions';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <TransitionProvider>
 *       {children}
 *     </TransitionProvider>
 *   );
 * }
 * ```
 *
 * @example Navigation
 * ```tsx
 * import { useTransitionNavigate } from '@/lib/transitions';
 *
 * function MyComponent() {
 *   const navigate = useTransitionNavigate();
 *
 *   return (
 *     <button onClick={() => navigate('/portal/login')}>
 *       Login
 *     </button>
 *   );
 * }
 * ```
 */

// Configuration
export {
  EASING,
  DURATION,
  LOGIN_TRANSITION,
  LOGOUT_TRANSITION,
  PUBLIC_TRANSITION,
  NAVY_COLORS,
  BREAKPOINTS,
  DEBUG_SHORTCUT,
  getTotalDuration,
} from './config';

// Types
export type {
  TransitionType,
  RouteCategory,
  TransitionPhase,
  EasingPreset,
  DurationPreset,
  TransitionNavigateOptions,
  QueuedNavigation,
  TransitionState,
  TransitionControls,
  TransitionContextValue,
  TransitionProviderProps,
  PageTransitionWrapperProps,
  DebugOverlayState,
  TransitionVariants,
} from './types';

export { getRouteCategory, detectTransitionType } from './types';

// Hooks
export { useTransition, usePrefersReducedMotion } from './hooks/useTransition';
export {
  useTransitionNavigate,
  useTransitionNavigation,
  usePortalNavigation,
} from './hooks/useNavigate';
export { useDebugOverlay, useTransitionTiming } from './hooks/useDebugOverlay';

// Components
export { TransitionProvider } from './components/TransitionProvider';
export {
  PageTransitionWrapper,
  TransitionContent,
} from './components/PageTransitionWrapper';
export { DebugOverlay, WithDebugOverlay } from './components/DebugOverlay';

// Re-export TransitionContext for advanced usage
export { TransitionContext } from './hooks/useTransition';
