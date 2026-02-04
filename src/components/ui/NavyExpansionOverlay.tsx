'use client';

import { motion } from 'framer-motion';
import { EASING, NAVY_COLORS } from '@/lib/transitions';

/**
 * Props for NavyExpansionOverlay
 */
interface NavyExpansionOverlayProps {
  /** Initial width of the navy panel (e.g., '50%', '14rem', '176px') */
  initialWidth: string;
  /** Duration of the expansion animation in seconds (default: 0.4) */
  duration?: number;
  /** Whether to show the overlay (controls visibility) */
  isVisible?: boolean;
}

/**
 * Navy panel expansion overlay for smooth exit transitions.
 *
 * Used for:
 * - Login page "Back to Website" button
 * - Logout page transition
 * - Dashboard "Back to Website" button
 *
 * The navy panel expands from its initial width to fill the screen,
 * creating a smooth wipe transition before navigation.
 *
 * @example
 * ```tsx
 * <NavyExpansionOverlay
 *   initialWidth="14rem"
 *   isVisible={isExiting}
 * />
 * ```
 */
export function NavyExpansionOverlay({
  initialWidth,
  duration = 0.4,
  isVisible = true,
}: NavyExpansionOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div className="fixed inset-0 z-[100] overflow-hidden navy-expansion-overlay">
      {/* White background (simulates the content area being covered) */}
      <div className="absolute inset-0 bg-white" />

      {/* Navy panel expanding from left to fill screen */}
      <motion.div
        className="absolute top-0 left-0 bottom-0"
        style={{ backgroundColor: NAVY_COLORS.primary }}
        initial={{ width: initialWidth }}
        animate={{ width: '100%' }}
        transition={{
          duration,
          ease: EASING.smooth,
        }}
      />
    </motion.div>
  );
}
