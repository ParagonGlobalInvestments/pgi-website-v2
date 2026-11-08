'use client';

import { useEffect } from 'react';

/**
 * Dev-only: loads react-grab (hover an element, ⌘C to copy its component
 * context). Importing the package initializes it in the browser. Loaded from
 * an effect rather than a <script> tag, which React 19 warns about.
 */
export function ReactGrab() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    import('react-grab').catch(() => {
      // Dev tooling only; never break the page.
    });
  }, []);

  return null;
}
