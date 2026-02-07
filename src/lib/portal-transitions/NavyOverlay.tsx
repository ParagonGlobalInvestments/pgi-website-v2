'use client';

/**
 * Unified Navy Overlay — renders all entrance/exit overlays.
 *
 * Mounted once in app/layout.tsx. Reads phase from context.
 * Renders nothing when idle. Uses clip-path: inset() for
 * compositor-accelerated (GPU) expansion — no layout thrashing.
 *
 * Replaces:
 * - NavyExpansionOverlay (exit flows)
 * - Header's 3 inline overlay blocks (entrance flows)
 */

import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { usePortalTransition } from './PortalTransitionContext';
import { NAVY, LAYOUT, EASING, TIMING } from './config';

export function NavyOverlay() {
  const { tag, flow, mobile } = usePortalTransition();

  // Only render during active transitions
  if (tag === 'idle' || tag === 'complete') return null;

  // --- EXIT FLOWS: navy expands from sidebar/header width to fill screen ---
  if (flow === 'exit:back' || flow === 'exit:logout') {
    const duration = mobile
      ? TIMING.exit.mobile / 1000
      : TIMING.exit.desktop / 1000;
    return (
      <motion.div
        key="exit-overlay"
        className="fixed inset-0 z-[100] overflow-hidden"
        style={{ backgroundColor: NAVY.primary }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Navy expanding from sidebar/header */}
        <motion.div
          className="absolute top-0 left-0"
          style={{ backgroundColor: NAVY.primary }}
          initial={
            mobile
              ? { width: '100%', height: LAYOUT.headerHeight }
              : { width: LAYOUT.sidebarWidth, height: '100%' }
          }
          animate={{ width: '100%', height: '100%' }}
          transition={{ duration, ease: EASING.smooth }}
        />
      </motion.div>
    );
  }

  // --- ENTRANCE:LOGIN flow ---
  if (flow === 'entrance:login') {
    if (mobile) {
      // Mobile: navy fills → hold with logo → compress to header height
      const isCompressing = tag === 'panel-slide';
      const isHolding = tag === 'navy-hold';
      return (
        <motion.div
          key="login-mobile-overlay"
          className="fixed inset-0 z-[100] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: EASING.smooth }}
        >
          <div className="absolute inset-0 bg-white" />
          <motion.div
            className="absolute top-0 left-0 w-full"
            style={{ backgroundColor: NAVY.primary }}
            initial={{ height: '100%' }}
            animate={{ height: isCompressing ? LAYOUT.headerHeight : '100%' }}
            transition={{ duration: 0.3, ease: EASING.smooth }}
          />
          {/* Centered logo during hold phase */}
          <AnimatePresence>
            {(tag === 'navy-fill' || isHolding) && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: EASING.smooth }}
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
            )}
          </AnimatePresence>
        </motion.div>
      );
    }

    // Desktop: navy fills → white panel slides in from right
    const showPanel = tag === 'panel-slide';
    return (
      <motion.div
        key="login-desktop-overlay"
        className="fixed inset-0 z-[100] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASING.smooth }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: NAVY.primary }}
        />
        {/* White panel sliding in from right */}
        <motion.div
          className="absolute top-0 right-0 bottom-0 bg-white"
          initial={{ width: 0 }}
          animate={{ width: showPanel ? '50%' : 0 }}
          transition={{ duration: 0.6, ease: EASING.smooth }}
        >
          {showPanel && (
            <motion.div
              className="h-full flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto" />
                <p className="text-gray-400 text-sm mt-3">Loading portal...</p>
              </div>
            </motion.div>
          )}
        </motion.div>
        {/* PGI logo on navy side during split view */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              className="absolute top-0 left-0 bottom-0 flex items-center justify-center pointer-events-none"
              style={{ width: '50%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: EASING.smooth }}
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
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // --- ENTRANCE:PORTAL flow (authenticated user clicking "Portal") ---
  if (flow === 'entrance:portal') {
    return (
      <motion.div
        key="portal-entrance-overlay"
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        <div className="absolute inset-0 bg-white" />
        <motion.div
          className="absolute top-0 left-0"
          style={{ backgroundColor: NAVY.primary }}
          initial={
            mobile
              ? { width: '100%', height: '100%' }
              : { width: '100%', height: '100%' }
          }
          animate={
            mobile
              ? { width: '100%', height: LAYOUT.headerHeight }
              : { width: LAYOUT.sidebarWidth, height: '100%' }
          }
          transition={{
            duration: mobile ? 0.3 : 0.4,
            ease: EASING.smooth,
          }}
        />
      </motion.div>
    );
  }

  // login:morph phases are handled by UnifiedPortalShell (sidebar width animation),
  // not by a fullscreen overlay — so we return null here.
  return null;
}
