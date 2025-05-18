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
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Set loading to false after initial page load - reduced time for quicker initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Reduced from 500ms to 300ms for faster initial load

    return () => clearTimeout(timer);
  }, []);

  // Handle page transitions
  useEffect(() => {
    if (prevPathname !== pathname && !isLoading) {
      setIsChangingPage(true);
      const timer = setTimeout(() => {
        setIsChangingPage(false);
      }, 400); // Quick page transition

      return () => clearTimeout(timer);
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname, isLoading]);

  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 8, // Reduced from 20 for subtler animation
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4, // Reduced from 0.6 for quicker animation
        ease: [0.25, 0.1, 0.25, 1], // Smoother cubic-bezier curve
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -8, // Reduced from -20 for subtler animation
      transition: {
        duration: 0.25, // Quicker exit
      },
    },
  };

  const loadingVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1], // Modern cubic-bezier
      },
    },
  };

  const logoVariants = {
    initial: { opacity: 0, scale: 0.9, rotate: -5 },
    animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1], // Spring-like effect
      },
    },
  };

  return (
    <>
      {/* Loading screen - shown on initial load or page change */}
      <AnimatePresence>
        {(isLoading || isChangingPage) && (
          <motion.div
            className="fixed inset-0 bg-pgi-dark-blue z-50 flex items-center justify-center"
            initial="initial"
            animate="initial"
            exit="exit"
            variants={loadingVariants}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1], // Spring-like effect
                },
              }}
              className="flex flex-col items-center"
            >
              <motion.div
                variants={logoVariants}
                initial="initial"
                animate="animate"
                className="relative"
              >
                {/* Glow effect behind logo */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0.8, 0.5],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'loop',
                    },
                  }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, 0, -2, 0],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'loop',
                      ease: 'easeInOut',
                    },
                  }}
                >
                  <img
                    src="/logos/pgiLogoTransparent.png"
                    alt="Paragon Global Investments"
                    className="w-24 h-24 object-contain rounded-full z-10 relative"
                  />
                </motion.div>
              </motion.div>

              {/* Modern loading indicator */}
              <motion.div
                className="mt-6 relative h-1 w-24 overflow-hidden rounded-full bg-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
              >
                <motion.div
                  className="absolute left-0 top-0 h-full bg-primary rounded-full"
                  animate={{
                    x: ['-100%', '100%'],
                    transition: {
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  style={{ width: '50%' }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with animation */}
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
