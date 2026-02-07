'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { usePortalTransition } from '@/lib/portal-transitions';
import { NAVY, LAYOUT } from '@/lib/portal-transitions/config';

export default function LogoutPage() {
  const supabase = createClient();
  const { start } = usePortalTransition();

  // Synchronous mobile check — must be correct on first render
  const [mobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.innerWidth < Number.parseInt(LAYOUT.mobileBreakpoint.toString())
      : false
  );

  // Immediately set body to navy so there's no white flash during logout
  useEffect(() => {
    document.documentElement.style.backgroundColor = NAVY.primary;
    document.body.style.backgroundColor = NAVY.primary;
  }, []);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error logging out:', error);
      }

      // Start the exit:logout flow — NavyOverlay handles the visual
      start('exit:logout', { mobile });
    };

    performLogout();

    // Fallback timeout
    const timer = setTimeout(() => {
      window.location.href =
        process.env.NEXT_PUBLIC_APP_URL || 'https://paragoninvestments.org';
    }, 2000);

    return () => clearTimeout(timer);
  }, [supabase, mobile, start]);

  // NavyOverlay renders at root layout level — this page returns nothing
  return null;
}
