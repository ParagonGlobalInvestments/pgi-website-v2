'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function PortalPage() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // In production, redirect to home page
    if (process.env.NODE_ENV === 'production') {
      router.replace('/');
      return;
    }

    if (isLoaded) {
      if (isSignedIn && userId) {
        // User is signed in, redirect to dashboard
        router.push('/portal/dashboard');
      } else {
        // User is not signed in, redirect to the custom sign-in path
        // configured in Clerk dashboard
        router.push('/portal/signin');
      }
    }
  }, [isLoaded, isSignedIn, userId, router]);

  // Show loading state while determining authentication
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#00172B] to-[#003E6B]">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <h2 className="text-white text-xl font-medium">Loading...</h2>
      </div>
    </div>
  );
}
