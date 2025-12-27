'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device based on screen width.
 * Threshold: 768px (matches Tailwind's md: breakpoint)
 *
 * @returns {boolean} true if screen width is less than 768px
 */
export function useIsMobile(threshold: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (SSR-safe)
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < threshold);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, [threshold]);

  return isMobile;
}
