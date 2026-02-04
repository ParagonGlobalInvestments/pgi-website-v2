/**
 * Unified Transition System - Configuration
 *
 * Central configuration for all animation timings, easing curves,
 * and transition behavior across the site.
 */

/**
 * Easing presets for consistent animation feel.
 * Use cubic-bezier arrays compatible with Framer Motion.
 */
export const EASING = {
  /** Smooth, elegant transitions for pages and major UI changes */
  smooth: [0.4, 0, 0.2, 1] as const,

  /** Quick, responsive interactions for buttons and micro-animations */
  snappy: [0.32, 0.72, 0, 1] as const,

  /** Playful overshoot for attention-grabbing elements */
  bounce: [0.34, 1.56, 0.64, 1] as const,

  /** Linear for progress indicators */
  linear: [0, 0, 1, 1] as const,
} as const;

/**
 * Duration presets in seconds for Framer Motion.
 */
export const DURATION = {
  /** No animation - instant swap */
  instant: 0,

  /** Quick micro-interactions (buttons, toggles) */
  fast: 0.15,

  /** Standard transitions (fades, simple moves) */
  normal: 0.3,

  /** Deliberate animations (panel slides, content reveals) */
  slow: 0.6,

  /** Dramatic, cinematic transitions (signature login) */
  dramatic: 1.0,

  /** Extended for greeting messages */
  greeting: 1.0,
} as const;

/**
 * Transition phase timings for the signature login animation.
 * Total: ~2.2s (or faster 1.2s for reverse)
 */
export const LOGIN_TRANSITION = {
  /** Phase 1: Header fades up, content + footer fade out */
  contentExit: 300,

  /** Phase 2: Brief navy hold while auth loads */
  navyHold: 200,

  /** Phase 3: White panel slides in from right */
  panelSlide: 600,

  /** Phase 4: Login form fades in */
  contentEnter: 100,

  /** Phase 5: "Hey [Name]!" greeting after auth */
  greeting: 1000,
} as const;

/**
 * Reverse transition timings (portal → public).
 * Snappier to feel responsive.
 */
export const LOGOUT_TRANSITION = {
  /** Dashboard content fades out */
  contentExit: 200,

  /** White panel slides back right */
  panelRetreat: 400,

  /** Navy fades to public content */
  navyToPublic: 200,

  /** Header fades down into place */
  headerEnter: 200,
} as const;

/**
 * Simple crossfade for public ↔ public navigation.
 */
export const PUBLIC_TRANSITION = {
  fadeOut: 200,
  fadeIn: 200,
} as const;

/**
 * Navy color standardization.
 * Primary matches PGI logo background for seamless transitions.
 */
export const NAVY_COLORS = {
  /** Primary navy - matches PGI logo bg, used for main backgrounds */
  primary: '#0a1628',

  /** Alternate navy - lighter for contrast sections on home page */
  alternate: '#0a192f',

  /** Legacy values kept for reference during migration */
  legacy: {
    navy: '#00172B',
    pgiDarkBlue: '#0A192F',
  },
} as const;

/**
 * Breakpoints for responsive transition behavior.
 */
export const BREAKPOINTS = {
  /** Below this: full-screen fade (no split panel) */
  mobile: 768,

  /** Below this: simplified animations */
  tablet: 1024,
} as const;

/**
 * Dev overlay keyboard shortcut.
 */
export const DEBUG_SHORTCUT = {
  key: 'KeyT',
  modifiers: ['ctrlKey', 'shiftKey'] as const,
} as const;

/**
 * Calculate total transition duration.
 */
export function getTotalDuration(phases: Record<string, number>): number {
  return Object.values(phases).reduce((sum, ms) => sum + ms, 0);
}
