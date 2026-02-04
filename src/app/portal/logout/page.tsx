'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { NavyExpansionOverlay } from '@/components/ui/NavyExpansionOverlay';

export default function LogoutPage() {
  const supabase = createClient();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Sign out first
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error logging out:', error);
      }

      // After sidebar expansion animation completes, navigate
      setTimeout(() => {
        // Use window.location for full page load so home mounts fresh with its animations
        window.location.href = '/';
      }, 500);
    };

    performLogout();

    // Fallback timeout in case something hangs
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 2000);

    return () => clearTimeout(timer);
  }, [supabase]);

  return (
    <NavyExpansionOverlay
      initialWidth="176px" // Sidebar width (w-44 = 176px)
    />
  );
}
