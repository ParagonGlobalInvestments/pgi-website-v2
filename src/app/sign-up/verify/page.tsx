'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    // In production, redirect to home page
    if (process.env.NODE_ENV === 'production') {
      router.replace('/');
    }
  }, [router]);

  // In development, show some verification content or redirect
  if (process.env.NODE_ENV === 'production') {
    return null; // This will briefly show while redirecting
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p>Please check your email to verify your account.</p>
      </div>
    </div>
  );
}
