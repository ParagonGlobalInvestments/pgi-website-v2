/**
 * Portal Transition System — Single Source of Truth
 *
 * Every setTimeout, spring config, and duration in the animation system
 * references this file. No hardcoded values elsewhere.
 */

/** Easing curves and spring configs */
export const EASING = {
  /** Smooth cubic-bezier for fades and opacity changes */
  smooth: [0.4, 0, 0.2, 1] as const,
  /** Critically-damped spring for structural morph (no overshoot) */
  morph: { type: 'spring' as const, stiffness: 300, damping: 30 },
  /** Slightly underdamped spring for element entrances (tiny overshoot) */
  enter: { type: 'spring' as const, stiffness: 200, damping: 20 },
  /** Snappy spring for nav indicator sliding */
  indicator: { type: 'spring' as const, stiffness: 400, damping: 25 },
} as const;

/** Phase durations in milliseconds. d = desktop, m = mobile. */
export const TIMING = {
  loginEntry: {
    desktopTotal: 1400,
    mobileTotal: 800,
    navyFill: { d: 600, m: 200 },
    panelSlide: { d: 600, m: 300 },
    hold: { d: 0, m: 300 },
  },
  greeting: 1200,
  morph: 500,
  exit: { desktop: 500, mobile: 300 },
  portalEntry: { desktop: 500, mobile: 300 },
} as const;

/** Layout dimensions — sidebar, header, breakpoints */
export const LAYOUT = {
  sidebarWidth: '14rem',
  collapsedWidth: '4.5rem',
  loginPanelWidth: '50%',
  headerHeight: '3.5rem',
  mobileBreakpoint: 768,
} as const;

/** Navy color palette */
export const NAVY = {
  primary: '#0a1628',
  alternate: '#0a192f',
} as const;

/**
 * Backwards-compatible re-exports.
 * Files outside the portal animation system (home page sections, etc.)
 * import EASING and NAVY_COLORS from @/lib/transitions. After that
 * barrel is deleted, they'll import from here instead.
 */
export const NAVY_COLORS = NAVY;
