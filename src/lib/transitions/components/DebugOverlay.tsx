'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTransition } from '../hooks/useTransition';
import { useDebugOverlay } from '../hooks/useDebugOverlay';
import { EASING, DURATION } from '../config';

/**
 * Development-only debug overlay for transition system.
 *
 * Shows:
 * - Current transition phase
 * - Time remaining in phase
 * - Queued navigations
 * - Reduced motion preference
 *
 * Toggle with Ctrl+Shift+T.
 */
export function DebugOverlay() {
  const { isVisible, isAvailable } = useDebugOverlay();
  const {
    isTransitioning,
    activeTransition,
    phase,
    phaseTimeRemaining,
    userName,
    queue,
    prefersReducedMotion,
  } = useTransition();

  // Only render in development
  if (!isAvailable) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: DURATION.fast, ease: EASING.snappy }}
          className="fixed bottom-4 right-4 z-[9999] w-80 rounded-lg bg-gray-900/95 p-4 font-mono text-xs text-white shadow-2xl backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center justify-between border-b border-gray-700 pb-2">
            <span className="font-semibold text-blue-400">
              🎬 Transition Debug
            </span>
            <span className="text-gray-500">Ctrl+Shift+T</span>
          </div>

          <div className="space-y-2">
            {/* Status */}
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span
                className={
                  isTransitioning ? 'text-yellow-400' : 'text-green-400'
                }
              >
                {isTransitioning ? '⏳ Transitioning' : '✓ Idle'}
              </span>
            </div>

            {/* Active Transition */}
            {activeTransition && (
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-cyan-400">{activeTransition}</span>
              </div>
            )}

            {/* Phase */}
            <div className="flex justify-between">
              <span className="text-gray-400">Phase:</span>
              <span
                className={
                  phase === 'idle'
                    ? 'text-gray-500'
                    : phase === 'complete'
                      ? 'text-green-400'
                      : 'text-orange-400'
                }
              >
                {phase}
              </span>
            </div>

            {/* Time Remaining */}
            {phaseTimeRemaining > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Remaining:</span>
                <span className="text-purple-400">{phaseTimeRemaining}ms</span>
              </div>
            )}

            {/* User Name */}
            {userName && (
              <div className="flex justify-between">
                <span className="text-gray-400">User:</span>
                <span className="text-pink-400">{userName}</span>
              </div>
            )}

            {/* Queue */}
            {queue.length > 0 && (
              <div className="mt-2 border-t border-gray-700 pt-2">
                <span className="text-gray-400">Queued ({queue.length}):</span>
                <ul className="mt-1 space-y-1">
                  {queue.map((item, index) => (
                    <li
                      key={`${item.path}-${item.timestamp}`}
                      className="truncate text-gray-500"
                    >
                      {index + 1}. {item.path}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reduced Motion */}
            <div className="mt-2 border-t border-gray-700 pt-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Reduced Motion:</span>
                <span
                  className={
                    prefersReducedMotion ? 'text-yellow-400' : 'text-gray-500'
                  }
                >
                  {prefersReducedMotion ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Phase Timeline Visualization */}
            {isTransitioning && (
              <div className="mt-2 border-t border-gray-700 pt-2">
                <div className="text-gray-400">Timeline:</div>
                <div className="mt-1 flex h-2 overflow-hidden rounded bg-gray-800">
                  <PhaseBar
                    phase={phase}
                    targetPhase="content-exit"
                    color="bg-red-500"
                  />
                  <PhaseBar
                    phase={phase}
                    targetPhase="navy-hold"
                    color="bg-blue-900"
                  />
                  <PhaseBar
                    phase={phase}
                    targetPhase="panel-slide"
                    color="bg-blue-500"
                  />
                  <PhaseBar
                    phase={phase}
                    targetPhase="content-enter"
                    color="bg-green-500"
                  />
                  <PhaseBar
                    phase={phase}
                    targetPhase="greeting"
                    color="bg-pink-500"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Visual indicator for phase progress.
 */
function PhaseBar({
  phase,
  targetPhase,
  color,
}: {
  phase: string;
  targetPhase: string;
  color: string;
}) {
  const phaseOrder = [
    'content-exit',
    'navy-hold',
    'panel-slide',
    'content-enter',
    'greeting',
    'complete',
  ];

  const currentIndex = phaseOrder.indexOf(phase);
  const targetIndex = phaseOrder.indexOf(targetPhase);

  const isActive = phase === targetPhase;
  const isComplete = currentIndex > targetIndex;

  return (
    <div
      className={`flex-1 transition-all duration-150 ${
        isActive ? `${color} animate-pulse` : isComplete ? color : 'bg-gray-700'
      }`}
    />
  );
}

/**
 * Wrapper that includes debug overlay.
 * Use this in development to automatically include the overlay.
 */
export function WithDebugOverlay({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DebugOverlay />
    </>
  );
}
