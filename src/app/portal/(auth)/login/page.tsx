'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortalShell } from '@/contexts/PortalShellContext';

function PortalLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { phase, userName, triggerTransition } = usePortalShell();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const justAuthenticated = searchParams?.get('authenticated') === 'true';
  const redirectTo = searchParams?.get('redirectTo') || '/portal';

  /**
   * Handle the post-OAuth redirect flow:
   * 1. Get user info
   * 2. Trigger the transition animation
   * 3. Navigate to dashboard (staying in same React tree!)
   */
  const handlePostAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Extract first name for greeting
    const firstName =
      user?.user_metadata?.full_name?.split(' ')[0] ||
      user?.user_metadata?.name?.split(' ')[0] ||
      '';

    // Trigger the transition animation sequence
    await triggerTransition(firstName);

    // Navigate using Next.js router (preserves React tree!)
    // Clean the redirectTo to ensure it's a valid portal path
    const cleanRedirectTo = redirectTo.startsWith('/portal')
      ? redirectTo
      : '/portal';

    router.push(cleanRedirectTo);
  }, [supabase.auth, triggerTransition, router, redirectTo]);

  // Run post-auth flow when returning from OAuth
  useEffect(() => {
    if (!justAuthenticated) return;
    handlePostAuth();
  }, [justAuthenticated, handlePostAuth]);

  // Initiate Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    const defaultDest = '/portal';
    const next = searchParams?.get('redirectTo') || defaultDest;

    // Redirect back to /portal/login with authenticated=true
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          prompt: 'select_account',
        },
        scopes: 'openid email profile',
      },
    });

    if (oauthError) {
      setError('Failed to log in. Please try again or contact support.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-center">
      <AnimatePresence mode="wait">
        {/* Idle state - show login form */}
        {phase === 'idle' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome to the PGI Portal
            </h1>

            {/* Error messages from OAuth failures */}
            {searchParams?.get('error') === 'auth_failed' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-left">
                <p className="text-sm text-red-600">
                  Authentication failed. Please try again.
                </p>
              </div>
            )}
            {searchParams?.get('error') === 'no_user' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-left">
                <p className="text-sm text-red-600">
                  Could not retrieve your account. Please try again.
                </p>
              </div>
            )}

            {/* Google login button */}
            <div className="mt-8">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center w-full px-6 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-left">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Success/transition states - show greeting */}
        {(phase === 'success' ||
          phase === 'fadeOut' ||
          phase === 'morphing') && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'fadeOut' || phase === 'morphing' ? 0 : 1,
              y: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-2xl font-semibold text-gray-900">
              Hey{userName ? ` ${userName}` : ''}!
            </h1>
            <p className="text-sm text-gray-500 mt-2">Welcome to the portal</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <PortalLoginContent />
    </Suspense>
  );
}
