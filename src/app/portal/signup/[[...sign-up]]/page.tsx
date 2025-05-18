'use client';

import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignUpPage() {
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
          <h1 className="text-xl font-bold">Join Paragon Global Investments</h1>
          <p className="text-sm text-gray-300 mt-1">
            Create an account to get started
          </p>
        </div>

        <div className="p-6">
          <SignUp
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
            path="/portal/signup"
            signInUrl="/portal/signin"
            redirectUrl="/portal/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
