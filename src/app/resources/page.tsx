'use client';

import { motion } from 'framer-motion';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/posthog';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';

// Animation variants
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const buttonHover = {
  scale: 1.05,
  backgroundColor: '#1f4287',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

const DRIVE_FOLDER_ID = '1ArM8sjxfNGaxxTHeTrjd1I-EqJWHvB49';
const DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}?usp=drive_link`;
const DRIVE_EMBED_URL = `https://drive.google.com/embeddedfolderview?id=${DRIVE_FOLDER_ID}#grid`;

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const [iframeError, setIframeError] = useState(false);
  const [isEduRequired, setIsEduRequired] = useState(true);

  useEffect(() => {
    // Check if .edu requirement is enabled
    const requireEdu =
      process.env.NEXT_PUBLIC_PGI_REQUIRE_EDU === 'true' ||
      process.env.PGI_REQUIRE_EDU === 'true';
    setIsEduRequired(requireEdu);
  }, []);

  const handleSignIn = () => {
    trackEvent('resources_cta_clicked', {
      page: '/resources',
      action: 'google_signin_initiated',
    });
    signIn('google', { callbackUrl: '/resources' });
  };

  const handleSwitchAccount = () => {
    trackEvent('resources_access_denied', {
      page: '/resources',
      action: 'switch_account_clicked',
      email: session?.user?.email,
    });
    signOut({ callbackUrl: '/resources' });
  };

  const handleDriveButtonClick = () => {
    trackEvent('resources_access_granted', {
      page: '/resources',
      action: 'drive_button_clicked',
      email: session?.user?.email,
    });
  };

  const handleIframeError = () => {
    setIframeError(true);
    trackEvent('resources_embed_blocked', {
      page: '/resources',
      action: 'iframe_blocked_fallback',
      email: session?.user?.email,
    });
  };

  const isValidEduEmail = (email: string) => {
    return email.toLowerCase().endsWith('.edu');
  };

  const shouldShowEduError =
    isEduRequired &&
    session?.user?.email &&
    !isValidEduEmail(session.user.email);

  if (status === 'loading') {
    return (
      <div className="bg-navy text-white min-h-screen flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-gray-300">Loading resources page...</p>
          <span className="sr-only">Please wait while the page loads</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy text-white min-h-screen">
      <motion.main
        className="py-16 md:py-24 lg:py-32 px-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        role="main"
        aria-label="PGI Resources Page"
      >
        <div className="container mx-auto">
          <motion.h1
            variants={fadeIn}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
          >
            <ShinyText
              text="PGI Resources"
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
            />
          </motion.h1>

          <motion.div
            className="max-w-5xl mx-auto text-center"
            variants={staggerContainer}
          >
            <motion.p
              className="text-base md:text-lg lg:text-xl mb-12 md:mb-16 text-gray-300 font-light leading-relaxed"
              variants={itemFadeIn}
            >
              Access educational materials, research templates, and resources to
              support your journey in value investing and algorithmic trading.
            </motion.p>
          </motion.div>

          {/* Authentication and Content Section */}
          <motion.div className="max-w-4xl mx-auto" variants={fadeIn}>
            {!session ? (
              /* Sign-in CTA */
              <div className="text-center">
                <motion.div
                  className="bg-darkNavy border border-gray-700 rounded-xl p-8 md:p-12 shadow-xl"
                  variants={itemFadeIn}
                >
                  <h2 className="text-xl md:text-2xl font-semibold mb-6 text-white">
                    Access Required
                  </h2>
                  <p className="text-gray-300 mb-8 text-base md:text-lg">
                    Sign in with your university Google account to access PGI's
                    exclusive resources.
                  </p>
                  <Button
                    onClick={handleSignIn}
                    variant="navy-accent"
                    size="lg"
                    className="text-base md:text-lg px-8 py-3 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-navy"
                    aria-label="Sign in with Google to access PGI resources"
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
                    Sign in with Google
                  </Button>
                </motion.div>
              </div>
            ) : shouldShowEduError ? (
              /* .edu validation error */
              <div className="text-center">
                <motion.div
                  className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 md:p-12 shadow-xl"
                  variants={itemFadeIn}
                >
                  <h2 className="text-xl md:text-2xl font-semibold mb-6 text-red-400">
                    University Email Required
                  </h2>
                  <p className="text-gray-300 mb-6 text-base md:text-lg">
                    Access to PGI resources is restricted to university
                    students. Please sign in with your .edu email address.
                  </p>
                  <p className="text-gray-400 mb-8 text-sm">
                    Currently signed in as: {session.user?.email}
                  </p>
                  <Button
                    onClick={handleSwitchAccount}
                    variant="outline"
                    size="lg"
                    className="text-base md:text-lg px-8 py-3 border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-red-900"
                    aria-label="Switch to a different Google account"
                  >
                    Switch Account
                  </Button>
                </motion.div>
              </div>
            ) : (
              /* Authenticated and validated - show resources */
              <div>
                <motion.div className="text-center mb-8" variants={itemFadeIn}>
                  <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                    Welcome, {session.user?.name?.split(' ')[0]}!
                  </h2>
                  <p className="text-gray-300 text-base md:text-lg mb-4">
                    Access granted. Explore our comprehensive resource library.
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Signed in as: {session.user?.email}
                  </p>
                  <button
                    onClick={handleSwitchAccount}
                    className="text-gray-400 hover:text-gray-300 text-sm underline transition-colors"
                  >
                    Sign out
                  </button>
                </motion.div>

                <motion.div
                  className="bg-darkNavy border border-gray-700 rounded-xl overflow-hidden shadow-xl"
                  variants={itemFadeIn}
                >
                  {!iframeError ? (
                    <iframe
                      src={DRIVE_EMBED_URL}
                      className="w-full h-[70vh] rounded-lg border-0"
                      onError={handleIframeError}
                      onLoad={() => {
                        // Check if iframe loaded successfully
                        setTimeout(() => {
                          try {
                            const iframe = document.querySelector('iframe');
                            if (iframe && !iframe.contentDocument) {
                              handleIframeError();
                            }
                          } catch (e) {
                            handleIframeError();
                          }
                        }, 3000);
                      }}
                      title="PGI Resources Drive Folder - Educational materials and templates"
                      aria-label="Google Drive folder containing PGI educational resources"
                      allow="fullscreen"
                      loading="lazy"
                    />
                  ) : (
                    /* Fallback button if iframe is blocked */
                    <div className="text-center p-12 md:p-16">
                      <h3 className="text-xl md:text-2xl font-semibold mb-6 text-white">
                        Resources Available
                      </h3>
                      <p className="text-gray-300 mb-8 text-base md:text-lg">
                        Access our comprehensive collection of educational
                        materials, templates, and research resources.
                      </p>
                      <a
                        href={DRIVE_FOLDER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleDriveButtonClick}
                      >
                        <Button
                          variant="navy-accent"
                          size="lg"
                          className="text-base md:text-lg px-8 py-3 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-darkNavy"
                          aria-label="Open PGI resources in Google Drive"
                        >
                          <svg
                            className="w-5 h-5 mr-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16l-5.084 8.6a1.89 1.89 0 01-3.288.001l-2.87-5.07a1.89 1.89 0 01.326-2.275L10.568 5.5a1.89 1.89 0 012.56-.001l4.44 2.66z" />
                          </svg>
                          Open Resources in Google Drive
                        </Button>
                      </a>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
