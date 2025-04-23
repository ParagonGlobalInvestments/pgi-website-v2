"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
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
