'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isDevOrEnabled } from '@/lib/featureFlags';

export default function InternshipsNotFound() {
  const router = useRouter();

  useEffect(() => {
    // If internships feature is disabled, redirect to dashboard
    if (!isDevOrEnabled('enableInternships')) {
      router.replace('/portal/dashboard');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Feature Not Available
      </h1>
      <p className="text-gray-600 mb-8">
        The internships feature is currently unavailable.
      </p>
      <button
        onClick={() => router.push('/portal/dashboard')}
        className="px-6 py-3 bg-[#003E6B] text-white rounded-lg hover:bg-[#002C4D] transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
