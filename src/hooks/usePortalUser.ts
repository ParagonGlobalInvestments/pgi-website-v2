'use client';

import useSWR from 'swr';
import type { User } from '@/types';

/**
 * Response shape from /api/users/me
 */
interface UserMeResponse {
  user: User;
}

/**
 * SWR fetcher for /api/users/me
 * Returns null if not authenticated or not a PGI member
 */
async function fetchPortalUser(): Promise<User | null> {
  try {
    const res = await fetch('/api/users/me');
    if (!res.ok) return null;
    const data: UserMeResponse = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Hook to fetch and cache portal user data.
 *
 * Uses SWR for:
 * - Request deduplication: Multiple components share one request
 * - Client-side caching: 30s dedupe interval prevents refetches
 * - Stale-while-revalidate: Shows cached data while refreshing
 *
 * @param enabled - Whether to fetch (default: true). Set to false when user not authenticated.
 * @returns { user, isLoading, error, mutate }
 */
export function usePortalUser(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR(
    // Only fetch if enabled (user is authenticated)
    enabled ? '/api/users/me' : null,
    fetchPortalUser,
    {
      // Cache for 30 seconds - prevents duplicate requests
      dedupingInterval: 30000,
      // Refetch on window focus so tab-switching gets fresh data
      revalidateOnFocus: true,
      // Don't refetch on reconnect
      revalidateOnReconnect: false,
      // Keep stale data while revalidating
      revalidateIfStale: true,
      // Retry failed requests once
      errorRetryCount: 1,
    }
  );

  return {
    user: data ?? null,
    isLoading,
    error,
    /** Manually revalidate user data */
    mutate,
    /** Whether the user is a PGI member */
    isMember: !!data,
  };
}
