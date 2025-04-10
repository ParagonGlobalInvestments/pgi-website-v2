"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // Set loading to false after initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  const loadingVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      {/* Initial loading screen */}
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-navy z-50 flex items-center justify-center"
          initial="initial"
          animate={isLoading ? "initial" : "exit"}
          exit="exit"
          variants={loadingVariants}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                },
              }}
            >
              <img
                src="/logos/pgiLogoTransparent.png"
                alt="Paragon Global Investments"
                className="w-32 h-32 object-contain rounded-full"
              />
            </motion.div>
            <motion.div
              className="flex space-x-2 mt-4"
              animate={{
                opacity: [0.5, 1, 0.5],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                },
              }}
            >
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Page content with animation */}
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="flex flex-col min-h-screen"
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageTransition;
