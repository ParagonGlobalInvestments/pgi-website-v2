'use client';

import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#00172B] to-[#003E6B]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 bg-[#00172B] text-white text-center">
          <div className="flex justify-center mb-2">
            <Image
              src="/logos/pgiLogoTransparent.png"
              alt="Paragon Global Investments"
              width={80}
              height={80}
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-xl font-bold">
            Sign in to Paragon Global Investments
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <div className="p-6">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-[#003E6B] hover:bg-[#00172B]',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'border-2 border-gray-200 hover:border-gray-300',
                footerAction: 'text-[#003E6B]',
              },
            }}
            routing="path"
            path="/portal/signin"
            signUpUrl="/portal/signup"
            redirectUrl="/portal/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
