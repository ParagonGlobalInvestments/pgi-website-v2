'use client';

import { SignUp } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    // In production, redirect to home page
    if (process.env.NODE_ENV === 'production') {
      router.replace('/');
    }
  }, [router]);

  // In development, show the Clerk SignUp component
  if (process.env.NODE_ENV === 'production') {
    return null; // This will briefly show while redirecting
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <SignUp routing="hash" />
    </div>
  );
}
