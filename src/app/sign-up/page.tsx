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

    const redirectTo =
      searchParams.get('redirectTo') || window.location.origin + '/resources';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          hd: '*.edu', // Hint to Google to prefer .edu accounts
        },
      },
    });

    if (error) {
      setError('Please sign up with your university Google account (.edu email required)');
    }
    setLoading(false);
  };

  // Email/password signup removed - Google only

  if (user) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4">
        <motion.div
          className="max-w-md w-full bg-darkNavy rounded-xl shadow-xl p-8 text-center border border-gray-700"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex justify-center mb-6">
            <Image
              src="/logos/pgiLogoTransparent.png"
              alt="PGI Logo"
              width={80}
              height={80}
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            You're already signed in!
          </h2>
          <p className="text-gray-300 mb-6">
            Welcome, {user.user_metadata?.full_name || user.email}
          </p>
          <div className="space-y-3">
            <Link href="/resources">
              <Button variant="navy-accent" className="w-full">
                Access PGI Resources
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full bg-darkNavy rounded-xl shadow-xl overflow-hidden border border-gray-700"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="p-6 bg-[#00172B] text-white text-center">
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
            Create your account to access resources
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* University Email Notice */}
          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm">
              Sign up with your university Google account
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Only .edu email addresses are permitted
            </p>
          </div>

          {/* Google Sign Up - Only Option */}
          <Button
            onClick={handleGoogleSignUp}
            disabled={loading}
            variant="outline"
            className="w-full border-gray-600 text-pgi-dark-blue py-3 text-base"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Creating account...' : 'Continue with University Google Account'}
          </Button>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/30">
              {error}
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link
                href="/sign-in"
                className="text-blue-400 hover:text-blue-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#00172B] to-[#003E6B] flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <SignUpPageContent />
    </Suspense>
  );
}
