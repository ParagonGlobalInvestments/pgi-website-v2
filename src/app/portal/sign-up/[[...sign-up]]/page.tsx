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

  // In production, return null while redirecting
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-dark">
          Member Registration
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-700 mb-6 text-center">
            Create an account to access the Paragon Global Investments
            dashboard.
          </p>
          <div className="flex justify-center">
            <SignUp
              signInUrl="/portal/signin/[[...sign-in]]"
              afterSignUpUrl="/portal/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
