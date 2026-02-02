'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

function SignInPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [checkingMembership, setCheckingMembership] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // If user is signed in, middleware will handle the redirect
      // We just need to check PGI membership here
      if (user) {
        setCheckingMembership(true);
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            // User exists in PGI database - redirect to portal
            const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL;
            const redirectTo =
              searchParams?.get('redirectTo') || '/portal/dashboard';

            if (portalUrl && redirectTo.startsWith('/portal/')) {
              const cleanPath = redirectTo.replace(/^\/portal/, '') || '/';
              window.location.href = `${portalUrl}${cleanPath}`;
            } else {
              window.location.href = redirectTo;
            }
            return;
          } else {
            // User not in PGI database - sign them out and redirect to resources
            await supabase.auth.signOut();
            window.location.href = '/resources?notMember=true';
            return;
          }
        } catch (error) {
          console.error('Error checking PGI membership:', error);
          // On error, sign them out and redirect
          await supabase.auth.signOut();
          window.location.href = '/resources?notMember=true';
          return;
        }
      }
    };
    checkUser();
  }, [supabase, searchParams]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    // Get the intended final destination after auth
    const next = searchParams?.get('redirectTo') || '/portal/dashboard';

    // Always route OAuth callback through the main domain so we only need
    // one Supabase redirect URL entry. The auth callback route handles
    // redirecting to the portal subdomain.
    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectTo = `${siteOrigin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes:
          'openid email profile https://www.googleapis.com/auth/drive.metadata.readonly',
      },
    });

    if (error) {
      setError('Failed to sign in. Please try again or contact support.');
    }
    setLoading(false);
  };

  // Email/password authentication removed - Google only

  if (user && checkingMembership) {
    return (
      <motion.div
        className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4A6BB1]"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Checking membership...
        </h2>
      </motion.div>
    );
  }

  // If user is signed in and we're checking membership, they should be redirected
  if (user) {
    return null;
  }

  return (
    <motion.div
      className="max-w-md w-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="p-5 bg-[#00172B] text-white text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/logos/pgiLogoTransparent.png"
            alt="Paragon Global Investments"
            width={80}
            height={80}
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold">PGI Member Portal</h1>
        <p className="text-sm text-gray-300 mt-2">
          Please sign in to continue
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          variant="outline"
          className="w-full border-gray-300 text-gray-900 py-3 text-base hover:bg-gray-50"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </Button>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <SignInPageContent />
    </Suspense>
  );
}
