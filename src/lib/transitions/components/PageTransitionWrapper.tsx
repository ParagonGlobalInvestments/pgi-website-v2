'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTransition } from '../hooks/useTransition';
import { EASING, DURATION, NAVY_COLORS } from '../config';

interface PageTransitionWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component that applies transition animations to page content.
 *
 * This component handles:
 * - Content fade in/out during transitions
 * - Navy overlay during portal transitions
 * - Coordinated timing with TransitionProvider phases
 *
 * @example
 * ```tsx
 * <PageTransitionWrapper>
 *   <main>{children}</main>
 * </PageTransitionWrapper>
 * ```
 */
export function PageTransitionWrapper({
  children,
  className = '',
}: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const { isTransitioning, phase, activeTransition, prefersReducedMotion } =
    useTransition();

  // Calculate opacity for content based on transition phase
  const getContentOpacity = () => {
    if (prefersReducedMotion) return 1;

    switch (phase) {
      case 'idle':
      case 'complete':
        return 1;
      case 'content-exit':
        return 0;
      case 'navy-hold':
      case 'panel-slide':
        return activeTransition === 'portal-enter' ? 0 : 1;
      case 'content-enter':
        return 1;
      case 'greeting':
        return 1;
      default:
        return 1;
    }
  };

  // Calculate navy overlay visibility
  const shouldShowNavyOverlay =
    isTransitioning &&
    (activeTransition === 'portal-enter' ||
      activeTransition === 'portal-exit') &&
    (phase === 'navy-hold' || phase === 'panel-slide');

  // Animation variants
  const contentVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : DURATION.normal,
        ease: EASING.smooth,
      },
    },
    hidden: {
      opacity: 0,
      y: -10,
      transition: {
        duration: prefersReducedMotion ? 0 : DURATION.normal,
        ease: EASING.smooth,
      },
    },
  };

  const navyOverlayVariants = {
    visible: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : DURATION.fast,
        ease: EASING.smooth,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : DURATION.fast,
        ease: EASING.smooth,
      },
    },
  };

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Navy overlay for portal transitions */}
      <AnimatePresence>
        {shouldShowNavyOverlay && (
          <motion.div
            key="navy-overlay"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={navyOverlayVariants}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: NAVY_COLORS.primary }}
          >
            {/* Breathing logo during load */}
            {phase === 'navy-hold' && (
              <div className="flex h-full items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Logo placeholder - can be replaced with actual logo */}
                  <div className="h-16 w-16 rounded-full bg-white/10" />
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          exit={prefersReducedMotion ? undefined : 'hidden'}
          variants={contentVariants}
          style={{ opacity: getContentOpacity() }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Lightweight wrapper for content that should fade during transitions.
 * Use inside PageTransitionWrapper for nested fade control.
 */
export function TransitionContent({ children }: { children: ReactNode }) {
  const { phase, prefersReducedMotion } = useTransition();

  const shouldFade = phase === 'content-exit';

  return (
    <motion.div
      animate={{
        opacity: shouldFade ? 0 : 1,
        y: shouldFade ? -10 : 0,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : DURATION.normal,
        ease: EASING.smooth,
      }}
    >
      {children}
    </motion.div>
  );
}
