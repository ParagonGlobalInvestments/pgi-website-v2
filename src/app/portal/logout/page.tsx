'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { NavyExpansionOverlay } from '@/components/ui/NavyExpansionOverlay';
import { SITE_URL } from '@/components/portal/constants';

export default function LogoutPage() {
  const supabase = createClient();
  // Synchronous mobile check — must be correct on first render since
  // the overlay mounts immediately (no user click to wait for useEffect)
  const [isMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Sign out first
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error logging out:', error);
      }

      // After expansion animation completes, navigate
      // Mobile: 300ms (shorter animation), Desktop: 500ms
      setTimeout(
        () => {
          // Use window.location for full page load so home mounts fresh with its animations
          window.location.href = SITE_URL;
        },
        isMobile ? 300 : 500
      );
    };

    performLogout();

    // Fallback timeout in case something hangs
    const timer = setTimeout(() => {
      window.location.href = SITE_URL;
    }, 2000);

    return () => clearTimeout(timer);
  }, [supabase, isMobile]);

  return (
    <NavyExpansionOverlay
      initialWidth="176px" // Sidebar width (w-44 = 176px)
      isMobile={isMobile}
    />
  );
}
