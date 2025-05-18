import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Direction options for the transition animation
 */
type TransitionDirection = 'vertical' | 'horizontal' | 'scale';

/**
 * Props for the SmoothTransition component
 */
interface SmoothTransitionProps {
  /** Whether the content should be visible */
  isVisible: boolean;
  /** Direction of the transition animation */
  direction?: TransitionDirection;
  /** Additional CSS classes */
  className?: string;
  /** React children to be rendered */
  children: React.ReactNode;
}

/**
 * SmoothTransition component
 *
 * A wrapper component that provides smooth enter/exit animations for its children
 * based on the isVisible prop. Useful for conditional rendering with animations.
 *
 * @example
 * ```tsx
 * <SmoothTransition isVisible={!isCollapsed} direction="vertical">
 *   <YourContent />
 * </SmoothTransition>
 * ```
 */
export function SmoothTransition({
  isVisible,
  direction = 'vertical',
  className = '',
  children,
}: SmoothTransitionProps) {
  // Define animation variants based on direction
  const variants = {
    vertical: {
      initial: { opacity: 0, height: 0, overflow: 'hidden' },
      animate: { opacity: 1, height: 'auto', overflow: 'visible' },
      exit: { opacity: 0, height: 0, overflow: 'hidden' },
    },
    horizontal: {
      initial: { opacity: 0, width: 0, overflow: 'hidden' },
      animate: { opacity: 1, width: 'auto', overflow: 'visible' },
      exit: { opacity: 0, width: 0, overflow: 'hidden' },
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
  };

  const selectedVariant = variants[direction];

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={selectedVariant}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
