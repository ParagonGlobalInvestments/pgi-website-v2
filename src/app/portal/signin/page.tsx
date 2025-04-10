"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    setIsProduction(
      !appUrl.includes("localhost") && !appUrl.includes("127.0.0.1")
    );
  }, []);

  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Member Portal
        </h1>
        <div className="bg-navy border border-gray-700 p-8 rounded-lg shadow-md">
          {isProduction ? (
            // Show "Coming Soon" in production
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-primary">
                Coming Soon
              </h2>
              <p className="text-gray-300 mb-6">
                The Paragon Global Investments member portal is currently under
                development. Please check back later for access to member
                resources and investment tools.
              </p>
            </div>
          ) : (
            // Show sign-in form in development
            <>
              <p className="text-gray-300 mb-6 text-center">
                Please sign in to access the Paragon Global Investments
                dashboard.
              </p>
              <div className="flex justify-center">
                <SignIn routing="hash" signUpUrl="/portal/sign-up" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
