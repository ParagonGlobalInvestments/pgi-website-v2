/**
 * Feature Flags — Simplified
 *
 * Directory and resources are always available (core features).
 * Only admin and development flags remain.
 */

export const featureFlags = {
  enableAdminFeatures:
    process.env.NEXT_PUBLIC_ENABLE_ADMIN_FEATURES !== 'false',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

export const isFeatureEnabled = (
  feature: keyof typeof featureFlags
): boolean => {
  return featureFlags[feature] === true;
};
