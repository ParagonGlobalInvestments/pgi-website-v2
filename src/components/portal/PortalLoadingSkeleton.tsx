'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { NAVY, EASING } from '@/lib/portal-transitions/config';

interface PortalLoadingSkeletonProps {
  showEntrance?: boolean;
}

/**
 * Loading skeleton for the portal layout.
 * Mirrors the sidebar + content structure for smooth loading transitions.
 */
export function PortalLoadingSkeleton({
  showEntrance = false,
}: PortalLoadingSkeletonProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => setIsHydrated(true), []);

  const shouldAnimateEntrance = isHydrated && showEntrance;

  return (
    <div className="flex min-h-screen bg-white">
      <div
        className="hidden lg:flex flex-shrink-0 flex-col w-56 h-screen sticky top-0 p-4 portal-sidebar"
        style={{ backgroundColor: NAVY.primary }}
      >
        <Skeleton className="h-8 w-32 bg-gray-700/40 mb-8 skeleton-shimmer-dark" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-8 w-full bg-gray-700/40 rounded-md skeleton-shimmer-dark" />
          <Skeleton className="h-8 w-full bg-gray-700/40 rounded-md skeleton-shimmer-dark" />
          <Skeleton className="h-8 w-full bg-gray-700/40 rounded-md skeleton-shimmer-dark" />
          <Skeleton className="h-8 w-full bg-gray-700/40 rounded-md skeleton-shimmer-dark" />
        </div>
      </div>
      <motion.div
        className="flex-1 lg:p-8 p-4 pt-24 lg:pt-8"
        initial={shouldAnimateEntrance ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={
          shouldAnimateEntrance
            ? { duration: 0.3, ease: EASING.smooth }
            : { duration: 0 }
        }
      >
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-6">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
