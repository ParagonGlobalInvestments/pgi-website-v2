'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    }, 200); // Reduced for faster initial load

    return () => clearTimeout(timer);
  }, []);

  // Simple animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const loadingVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <>
      {/* Simple loading screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-pgi-dark-blue z-50 flex items-center justify-center"
            initial="initial"
            animate="initial"
            exit="exit"
            variants={loadingVariants}
          >
            <div className="flex flex-col items-center">
              <img
                src="/logos/pgiLogoTransparent.png"
                alt="Paragon Global Investments"
                className="w-16 h-16 object-contain"
              />
              {/* Simple loading indicator */}
              <div className="mt-4 h-1 w-24 overflow-hidden rounded-full bg-gray-700">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{
                    x: ['-100%', '100%'],
                    transition: {
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  style={{ width: '50%' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with simple fade transition */}
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </>
  );
};

export default PageTransition;
