'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { useMockUser } from '@/contexts/MockUserContext';
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
 * When mock mode is active (admin only), overlays mocked role/program
 * on the real user. API calls always use the real auth token.
 *
 * @param enabled - Whether to fetch (default: true). Set to false when user not authenticated.
 * @returns { user, realUser, isLoading, error, mutate, isMember }
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

  const { mock } = useMockUser();

  // Overlay mock role/program when active (admin only, client-side only)
  const user = useMemo(() => {
    if (!data) return null;
    if (!mock.isActive || data.role !== 'admin') return data;
    return { ...data, role: mock.role, program: mock.program } as User;
  }, [data, mock.isActive, mock.role, mock.program]);

  return {
    /** User with mock overlay applied (if active) */
    user: user ?? null,
    /** Real user — never mocked. Use for admin checks in mock UI. */
    realUser: data ?? null,
    isLoading,
    error,
    /** Manually revalidate user data */
    mutate,
    /** Whether the user is a PGI member */
    isMember: !!data,
  };
}
