'use client';

import { motion } from 'framer-motion';
import { EASING, NAVY_COLORS } from '@/lib/transitions';
import { useIsMobile } from '@/hooks/useIsMobile';

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
 * Desktop: Navy panel expands left-to-right (matches sidebar layout).
 * Mobile: Navy bar expands top-to-bottom (matches header layout).
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
  const isMobile = useIsMobile();
  const mobileDuration = duration * 0.6; // 40% faster on mobile

  if (!isVisible) return null;

  return (
    <motion.div className="fixed inset-0 z-[100] overflow-hidden navy-expansion-overlay">
      {/* White background (simulates the content area being covered) */}
      <div className="absolute inset-0 bg-white" />

      {/* Navy panel: mobile expands top-down, desktop expands left-right */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ backgroundColor: NAVY_COLORS.primary }}
        initial={
          isMobile
            ? { width: '100%', height: '3.5rem' }
            : { width: initialWidth, height: '100%' }
        }
        animate={{ width: '100%', height: '100%' }}
        transition={{
          duration: isMobile ? mobileDuration : duration,
          ease: EASING.smooth,
        }}
      />
    </motion.div>
  );
}
