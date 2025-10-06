'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export default function SignOutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Attempt to sign out when the component mounts
    const performSignOut = async () => {
      try {
        await supabase.auth.signOut();
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
        // Fallback redirect if sign out fails
        router.push('/');
      }
    };

    // Auto-redirect to home page after 3 seconds regardless
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    performSignOut();

    return () => clearTimeout(timer);
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Signing Out</h1>
        <p className="text-gray-600 mb-6">
          Please wait while we sign you out of your account...
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="bg-primary hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            Sign Out Now
          </button>
        </div>

        <p className="mt-6 text-gray-500 text-sm">
          You will be redirected to the home page automatically.
        </p>
      </div>
    </div>
  );
}
