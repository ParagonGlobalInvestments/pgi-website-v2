/**
 * Unified Transition System - TypeScript Types
 */

import type { EASING, DURATION } from './config';

/**
 * Transition type determines which animation sequence to use.
 */
export type TransitionType =
  | 'none' // Instant, no animation
  | 'crossfade' // Simple fade (public ↔ public)
  | 'portal-enter' // Signature animation (public → portal)
  | 'portal-exit' // Reverse animation (portal → public)
  | 'instant'; // Portal internal navigation

/**
 * Route category for automatic transition detection.
 */
export type RouteCategory = 'public' | 'portal' | 'auth';

/**
 * Current phase of the transition animation.
 */
export type TransitionPhase =
  | 'idle' // No transition active
  | 'content-exit' // Current content fading out
  | 'navy-hold' // Navy background visible, waiting
  | 'panel-slide' // White panel sliding in/out
  | 'content-enter' // New content fading in
  | 'greeting' // "Hey [Name]!" message
  | 'complete'; // Transition finished

/**
 * Easing preset names.
 */
export type EasingPreset = keyof typeof EASING;

/**
 * Duration preset names.
 */
export type DurationPreset = keyof typeof DURATION;

/**
 * Navigation options with transition overrides.
 */
export interface TransitionNavigateOptions {
  /** Override automatic transition detection */
  transition?: TransitionType;

  /** Replace history instead of push */
  replace?: boolean;

  /** Scroll to top after navigation */
  scroll?: boolean;

  /** User name for greeting (portal-enter only) */
  userName?: string;
}

/**
 * Queued navigation entry.
 */
export interface QueuedNavigation {
  path: string;
  options: TransitionNavigateOptions;
  timestamp: number;
}

/**
 * Transition state exposed by the provider.
 */
export interface TransitionState {
  /** Is any transition currently active? */
  isTransitioning: boolean;

  /** Current transition type in progress */
  activeTransition: TransitionType | null;

  /** Current phase of the transition */
  phase: TransitionPhase;

  /** Time remaining in current phase (ms) */
  phaseTimeRemaining: number;

  /** User name for greeting display */
  userName: string;

  /** Navigation queue (shows pending navigations) */
  queue: QueuedNavigation[];

  /** Whether reduced motion is preferred */
  prefersReducedMotion: boolean;
}

/**
 * Transition controls exposed by the provider.
 */
export interface TransitionControls {
  /** Navigate with transition */
  navigate: (path: string, options?: TransitionNavigateOptions) => void;

  /** Start portal enter transition (public → portal) */
  enterPortal: (userName?: string) => Promise<void>;

  /** Start portal exit transition (portal → public) */
  exitPortal: () => Promise<void>;

  /** Skip current transition (emergency exit) */
  skipTransition: () => void;

  /** Reset to idle state */
  reset: () => void;
}

/**
 * Combined context value.
 */
export interface TransitionContextValue
  extends TransitionState, TransitionControls {}

/**
 * Props for TransitionProvider.
 */
export interface TransitionProviderProps {
  children: React.ReactNode;
}

/**
 * Props for PageTransitionWrapper.
 */
export interface PageTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Debug overlay state.
 */
export interface DebugOverlayState {
  isVisible: boolean;
  toggle: () => void;
}

/**
 * Animation variant helpers for Framer Motion.
 */
export interface TransitionVariants {
  /** Content exit animation */
  exit: {
    opacity: number;
    y?: number;
    transition: { duration: number; ease: readonly number[] };
  };
  /** Content enter animation */
  enter: {
    opacity: number;
    y?: number;
    transition: { duration: number; ease: readonly number[] };
  };
  /** Hidden state */
  hidden: {
    opacity: number;
  };
}

/**
 * Helper to detect route category from pathname.
 */
export function getRouteCategory(pathname: string): RouteCategory {
  if (pathname.startsWith('/portal')) {
    if (pathname.includes('/login') || pathname.includes('/logout')) {
      return 'auth';
    }
    return 'portal';
  }
  return 'public';
}

/**
 * Determine transition type between two routes.
 */
export function detectTransitionType(from: string, to: string): TransitionType {
  const fromCategory = getRouteCategory(from);
  const toCategory = getRouteCategory(to);

  // Same category = simple crossfade or instant
  if (fromCategory === toCategory) {
    // Portal internal = instant
    if (fromCategory === 'portal') {
      return 'instant';
    }
    // Public pages = crossfade
    return 'crossfade';
  }

  // Public → Portal (including auth pages) = portal-enter
  if (
    fromCategory === 'public' &&
    (toCategory === 'portal' || toCategory === 'auth')
  ) {
    return 'portal-enter';
  }

  // Portal → Public = portal-exit
  if (
    (fromCategory === 'portal' || fromCategory === 'auth') &&
    toCategory === 'public'
  ) {
    return 'portal-exit';
  }

  // Auth transitions within portal
  if (fromCategory === 'auth' && toCategory === 'portal') {
    // Login page → Dashboard after auth (handled by PortalShellContext morph)
    return 'none';
  }

  // Default fallback
  return 'crossfade';
}
