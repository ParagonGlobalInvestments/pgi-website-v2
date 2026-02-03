'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for the portal layout.
 * Mirrors the sidebar + content structure for smooth loading transitions.
 */
export function PortalLoadingSkeleton() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar skeleton (desktop only) */}
      <div className="hidden lg:flex flex-shrink-0 flex-col w-56 bg-[#00172B] h-screen sticky top-0 p-4">
        <Skeleton className="h-8 w-32 bg-gray-700/40 mb-8" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-8 w-full bg-gray-700/40 rounded-md" />
          <Skeleton className="h-8 w-full bg-gray-700/40 rounded-md" />
          <Skeleton className="h-8 w-full bg-gray-700/40 rounded-md" />
          <Skeleton className="h-8 w-full bg-gray-700/40 rounded-md" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 lg:p-8 p-4 pt-24 lg:pt-8">
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
      </div>
    </div>
  );
}
