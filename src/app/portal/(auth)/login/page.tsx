'use client';

import { useEffect, useReducer, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mutate } from 'swr';
import { createClient } from '@/lib/supabase/browser';
import { motion, AnimatePresence } from 'motion/react';
import { usePortalTransition, usePortalExit } from '@/lib/portal-transitions';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import {
  isOAuthRejectionHash,
  isSigningIn,
  loginError,
  loginHeading,
  loginReducer,
  loginScreen,
  parseLoginParams,
  shouldStartPostAuth,
} from './loginState';

function PortalLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { tag, flow, userName, start } = usePortalTransition();
  const { handleExit } = usePortalExit();

  // Parsed once from the callback's URL params; events move it from there
  const [state, dispatch] = useReducer(
    loginReducer,
    searchParams,
    parseLoginParams
  );

  const redirectTo = searchParams.get('redirectTo') || '/portal';

  // Consume one-shot URL signals: the notMember flag (already in `state`) and
  // OAuth errors in the hash fragment (client-only, so read after mount)
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('notMember')) {
      url.searchParams.delete('notMember');
      window.history.replaceState({}, '', url.toString());
    }

    const hash = window.location.hash;
    dispatch({ type: 'URL_HASH', hash });
    if (isOAuthRejectionHash(hash)) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Leaving for Google and coming back via the back/forward cache
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) dispatch({ type: 'PAGE_RESTORED' });
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  /**
   * Post-OAuth flow: get user → warm the cache → hand off to login:morph
   */
  const handlePostAuth = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const firstName =
        user?.user_metadata.full_name?.split(' ')[0] ||
        user?.user_metadata.name?.split(' ')[0] ||
        '';

      // Pre-warm SWR cache BEFORE animation — avoids mid-animation re-render
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          if (data?.user)
            mutate('/api/users/me', data.user, { revalidate: false });
        }
      } catch {
        // Non-critical
      }

      // greeting (1200ms) → morph (500ms) → complete; we navigate on complete
      start('login:morph', { mobile: false, userName: firstName });
    } catch {
      dispatch({ type: 'POST_AUTH_FAILED' });
    }
  }, [supabase.auth, start]);

  // Navigate when login:morph completes (an entrance:login flow also ends in
  // `complete` here, until the route change settles it)
  useEffect(() => {
    if (tag !== 'complete' || flow !== 'login:morph') return;
    const cleanRedirectTo = redirectTo.startsWith('/portal')
      ? redirectTo
      : '/portal';
    router.push(cleanRedirectTo);
  }, [tag, flow, router, redirectTo]);

  // Run post-auth flow when returning from OAuth (ref guards against StrictMode
  // double-invoke; a morph that already completed only needs the navigation)
  const postAuthStarted = useRef(false);
  const runPostAuth = shouldStartPostAuth(state, tag, flow);
  useEffect(() => {
    if (!runPostAuth || postAuthStarted.current) return;
    postAuthStarted.current = true;
    handlePostAuth();
  }, [runPostAuth, handlePostAuth]);

  // Initiate Google OAuth login
  const handleGoogleLogin = async () => {
    dispatch({ type: 'OAUTH_STARTED' });

    const defaultDest = '/portal';
    const next = searchParams.get('redirectTo') || defaultDest;
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: { prompt: 'select_account' },
        scopes: 'openid email profile',
      },
    });

    if (oauthError) dispatch({ type: 'OAUTH_FAILED' });
  };

  const screen = loginScreen(state);
  const heading = loginHeading(state);
  const signingIn = isSigningIn(state);
  const error = loginError(state);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="w-full text-center">
      <AnimatePresence mode="wait">
        {/* Idle/Welcome state */}
        {tag === 'idle' && (
          <motion.div
            key={`content-${screen}`}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="font-semibold text-gray-900 min-h-[2.5rem] flex items-center justify-center">
              <DecryptedText
                key={`decrypt-${heading}`}
                text={heading}
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={40}
                useOriginalCharsOnly={true}
                parentClassName="whitespace-nowrap"
                className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900"
                encryptedClassName="text-lg sm:text-xl md:text-2xl font-semibold text-gray-400"
              />
            </h1>

            {screen === 'rejected' && (
              <p className="mt-3 text-sm text-gray-500">
                Please sign in with your school email first. Once you&apos;re
                in, you can link a personal Google account from your profile. If
                you still can&apos;t get in, contact a PGI admin.
              </p>
            )}

            {error?.source === 'callback' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-left">
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            )}

            {/* The idle view always offers sign-in (disabled while signing in) */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <button
                onClick={handleGoogleLogin}
                disabled={signingIn}
                className="flex items-center justify-center w-full px-6 py-3.5 rounded-xl border border-gray-100 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-200 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(0,0,0,0.08),0_4px_20px_rgba(0,0,0,0.04)]"
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
                {signingIn ? 'Signing in...' : 'Continue with Google'}
              </button>

              {error?.source === 'client' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-left">
                  <p className="text-red-600 text-sm">{error.message}</p>
                </div>
              )}

              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <button
                  onClick={handleExit}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Go back to website
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Success/transition states — greeting with DecryptedText */}
        {(tag === 'greeting' || tag === 'morph') && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: tag === 'morph' ? 0 : 1,
              y: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="font-semibold text-gray-900 min-h-[2.5rem] flex items-center justify-center">
              <DecryptedText
                key={`greeting-${userName}`}
                text={userName ? `Hey ${userName}!` : 'Hey!'}
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={50}
                useOriginalCharsOnly={true}
                parentClassName="whitespace-nowrap"
                className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900"
                encryptedClassName="text-lg sm:text-xl md:text-2xl font-semibold text-gray-400"
              />
            </h1>
            <motion.p
              className="text-sm text-gray-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              Welcome to the portal
            </motion.p>
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
