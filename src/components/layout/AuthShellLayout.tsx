'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AuthTransitionProvider,
  useAuthTransition,
} from '@/contexts/AuthTransitionContext';

const TRANSITION_DURATION = 0.8;
// Use rem for accessibility - matches portal sidebar (14rem = 224px)
const SIDEBAR_WIDTH = '14rem';

const easing = [0.4, 0, 0.2, 1];

function AuthShellLayoutInner({ children }: { children: React.ReactNode }) {
  const { phase } = useAuthTransition();

  // Determine what's visible based on phase
  const showLogo = phase === 'idle' || phase === 'success';
  const showContent =
    phase === 'idle' || phase === 'success' || phase === 'fadeOut';
  const shouldShrink = phase === 'shrink' || phase === 'complete';

  return (
    <div className="flex min-h-screen">
      <style>{`html, body { background-color: #0a1628; }`}</style>

      {/* Left Panel */}
      <motion.div
        className="hidden lg:flex bg-[#0a1628] relative overflow-hidden flex-col"
        initial={{ width: '50%' }}
        animate={{ width: shouldShrink ? SIDEBAR_WIDTH : '50%' }}
        transition={{
          duration: TRANSITION_DURATION,
          ease: easing,
        }}
      >
        {/* Logo - Centered, always visible until fadeOut phase */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ opacity: showLogo ? 1 : 0 }}
            transition={{ duration: 0.25, ease: easing }}
          >
            <Image
              src="/logos/pgiLogo.jpg"
              alt="Paragon Global Investments"
              width={110}
              height={40}
              className="w-auto"
              priority
            />
          </motion.div>
        </div>

        {/* Back to Website */}
        <motion.div
          className="relative z-10 px-4 py-4"
          animate={{ opacity: phase === 'idle' ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL || '/'}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Back to Website
          </a>
        </motion.div>
      </motion.div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex flex-col min-h-screen relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-[#0a1628] px-6 py-4">
          <div className="flex items-center justify-between">
            <Image
              src="/logos/pgiLogoTransparent.png"
              alt="PGI"
              width={100}
              height={20}
              className="h-6 w-auto"
            />
            <a
              href={process.env.NEXT_PUBLIC_SITE_URL || '/'}
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Back to Website
            </a>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 relative">
          {/* Content - visible during idle, success, and fadeOut phases */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                key="login-content"
                className="w-full max-w-[340px]"
                initial={{ opacity: 1 }}
                animate={{ opacity: phase === 'fadeOut' ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: easing }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>

          {/* No loading spinner - navigate directly to portal skeleton */}
        </div>

        {/* Footer - Terms/Privacy with absolute URLs for subdomain compatibility */}
        <motion.footer
          className="px-6 py-4 text-center"
          animate={{ opacity: phase === 'idle' ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <a
              href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/terms`}
              className="hover:text-gray-600 transition-colors"
            >
              Terms
            </a>
            <span className="text-gray-300">·</span>
            <a
              href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/privacy`}
              className="hover:text-gray-600 transition-colors"
            >
              Privacy
            </a>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default function AuthShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthTransitionProvider>
      <AuthShellLayoutInner>{children}</AuthShellLayoutInner>
    </AuthTransitionProvider>
  );
}
