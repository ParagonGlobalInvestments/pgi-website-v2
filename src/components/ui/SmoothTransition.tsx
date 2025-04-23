import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SmoothTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  direction?: "vertical" | "horizontal" | "scale" | "fade";
  durationIn?: number;
  durationOut?: number;
  delay?: number;
  className?: string;
}

export const SmoothTransition = ({
  children,
  isVisible,
  direction = "fade",
  durationIn = 0.2,
  durationOut = 0.15,
  delay = 0,
  className = "",
}: SmoothTransitionProps) => {
  // Define variants for different directions
  const variants = {
    vertical: {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    horizontal: {
      initial: { opacity: 0, x: -10 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -10 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          initial={variants[direction].initial}
          animate={variants[direction].animate}
          exit={variants[direction].exit}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: durationIn,
            exitDuration: durationOut,
            delay,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
