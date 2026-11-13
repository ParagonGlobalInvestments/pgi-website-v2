'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { toast } from 'sonner';
import { usePortalUser } from '@/hooks/usePortalUser';
import {
  GRADUATION_API_PATH,
  GRADUATION_PAGE_PATH,
  fetchGraduationOverview,
  graduationPromptKey,
} from '@/lib/graduation';

/**
 * Once per admin session, offer to graduate members whose class year has
 * passed (see `getGraduatedClassYear`). Renders nothing.
 */
export function GraduationPrompt() {
  const { user } = usePortalUser();
  const isAdmin = user?.role === 'admin';
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);

  const { data } = useSWR(
    isAdmin ? GRADUATION_API_PATH : null,
    fetchGraduationOverview,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (shown.current || !data || data.candidates.length === 0) return;
    // Already on the graduation page — nothing to prompt.
    if (pathname?.endsWith('/graduation')) return;

    const key = graduationPromptKey(data.classYear);
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Storage unavailable: fall back to once per page load.
    }
    shown.current = true;

    const count = data.candidates.length;
    toast(`Graduate the Class of ${data.classYear}?`, {
      description: `${count} ${count === 1 ? 'member' : 'members'} from the Class of ${data.classYear} or earlier ${count === 1 ? 'is' : 'are'} still active.`,
      duration: Infinity,
      action: {
        label: 'Review',
        onClick: () => router.push(GRADUATION_PAGE_PATH),
      },
      cancel: { label: 'Not now', onClick: () => {} },
    });
  }, [data, pathname, router]);

  return null;
}
