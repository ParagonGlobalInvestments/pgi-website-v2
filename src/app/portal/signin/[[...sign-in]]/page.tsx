"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Member Portal
        </h1>
        <div className="bg-navy border border-gray-700 p-8 rounded-lg shadow-md">
          <p className="text-gray-300 mb-6 text-center">
            Please sign in to access the Paragon Global Investments dashboard.
          </p>
          <div className="flex justify-center">
            <SignIn
              signUpUrl="/portal/sign-up/[[...sign-up]]"
              afterSignInUrl="/portal/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
