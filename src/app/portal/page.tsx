'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalPage() {
  // Portal availability is checked in layout.tsx (server-side)
  const router = useRouter();

  useEffect(() => {
    // Middleware already checks if user is authenticated
    // Just redirect to dashboard
    router.replace('/portal/dashboard');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      <h2 className="text-white text-xl font-medium">Loading...</h2>
    </div>
  );
}
