/**
 * Feature Flags Configuration
 *
 * Centralized feature flag system using environment variables.
 * All flags default to false for production safety.
 */

export const featureFlags = {
  // Stats visibility on dashboard
  showStats: process.env.NEXT_PUBLIC_SHOW_STATS === 'true',

  // Internships feature (pages, buttons, etc)
  enableInternships: process.env.NEXT_PUBLIC_ENABLE_INTERNSHIPS === 'true',

  // Admin features (for testing/debugging)
  enableAdminFeatures:
    process.env.NEXT_PUBLIC_ENABLE_ADMIN_FEATURES !== 'false', // Default true

  // Development mode (automatically detected)
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

/**
 * Helper to check if a feature is enabled
 */
export const isFeatureEnabled = (
  feature: keyof typeof featureFlags
): boolean => {
  return featureFlags[feature] === true;
};

/**
 * Combined check for features that should work in both dev mode OR when explicitly enabled
 */
export const isDevOrEnabled = (
  feature: 'showStats' | 'enableInternships'
): boolean => {
  return featureFlags.isDevelopment || featureFlags[feature];
};
