'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
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

function SignUpPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [supabase]);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    // Get the intended final destination after auth
    // Always use /portal/ prefix for the auth callback route (server-side),
    // which handles stripping it when redirecting to the portal subdomain.
    const defaultDest = '/portal/dashboard';
    const next = searchParams.get('redirectTo') || defaultDest;

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
      setError('Failed to sign up. Please try again or contact support.');
    }
    setLoading(false);
  };

  // Email/password signup removed - Google only

  if (user) {
    return (
      <motion.div
        className="max-w-lg"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1 className="text-2xl font-semibold text-gray-900">
          You&apos;re already signed in
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome, {user.user_metadata?.full_name || user.email}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/resources"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#00172B] text-white text-sm font-medium hover:bg-[#002C4D] transition-colors"
          >
            Access PGI Resources
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-lg"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <h1 className="text-2xl font-semibold text-gray-900">Sign up</h1>
      <p className="text-gray-500 mt-1">
        Create your account to access PGI resources.
      </p>

      <div className="mt-8 space-y-5">
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="flex items-center w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
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
          {loading ? 'Signing up...' : 'Continue with Google'}
        </button>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <p className="text-gray-400 text-sm">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="text-gray-500 text-sm">Loading...</div>
      }
    >
      <SignUpPageContent />
    </Suspense>
  );
}
