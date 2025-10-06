'use client';

import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/posthog';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import BentoFolderGrid from '@/components/drive/BentoFolderGrid';
import NewsletterSignup from '@/components/newsletter/NewsletterSignup';
import { toast } from 'sonner';
import {
  BookOpenIcon,
  TrendingUpIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  LockIcon,
  ExternalLinkIcon,
} from 'lucide-react';

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

const DRIVE_FOLDER_ID = '1ArM8sjxfNGaxxTHeTrjd1I-EqJWHvB49';
const DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}?usp=drive_link`;

// Placeholder folders for non-signed-in users
const PLACEHOLDER_FOLDERS = [
  {
    id: 'placeholder-1',
    name: 'Educational Materials',
    icon: BookOpenIcon,
    description: 'Access comprehensive learning resources',
    size: 'large',
  },
  {
    id: 'placeholder-2',
    name: 'Investment Research',
    icon: TrendingUpIcon,
    description: 'Market analysis and research templates',
    size: 'medium',
  },
  {
    id: 'placeholder-3',
    name: 'Training Resources',
    icon: GraduationCapIcon,
    description: 'Professional development materials',
    size: 'medium',
  },
  {
    id: 'placeholder-4',
    name: 'Career Resources',
    icon: BriefcaseIcon,
    description: 'Career guidance and opportunities',
    size: 'wide',
  },
];

export default function ResourcesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPGIMember, setIsPGIMember] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check if we should show the non-member toast
    if (searchParams?.get('notMember') === 'true') {
      // Show toast notification
      toast.error('Not a PGI Member', {
        description: 'Submit your email to stay updated or apply to join PGI.',
        duration: 6000,
        action: {
          label: 'Apply',
          onClick: () => {
            window.location.href = '/apply#interest-form';
          },
        },
      });
      // Clean up the URL parameter
      window.history.replaceState({}, '', '/resources');
    }
  }, [searchParams]);

  useEffect(() => {
    // Check user authentication and PGI membership
    const checkUserStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user?.email) {
        // User is authenticated - check if they're in the PGI database
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            // User exists in PGI database
            setIsPGIMember(true);
          } else {
            // User authenticated but not a PGI member
            // Sign them out and show public resources
            await supabase.auth.signOut();
            setUser(null);
            setIsPGIMember(null);
            // Show toast notification
            toast.error('Not a PGI Member', {
              description:
                'Submit your email to stay updated or apply to join PGI.',
              duration: 6000,
              action: {
                label: 'Apply',
                onClick: () => {
                  window.location.href = '/apply#interest-form';
                },
              },
            });
          }
        } catch (error) {
          console.error('Error checking PGI membership:', error);
          // On error, assume not a member
          await supabase.auth.signOut();
          setUser(null);
          setIsPGIMember(null);
        }
      } else {
        // Not authenticated - show public resources
        setIsPGIMember(null);
      }

      setLoading(false);
    };

    checkUserStatus();
  }, [supabase]);

  const handleSignIn = async () => {
    trackEvent('resources_cta_clicked', {
      page: '/resources',
      action: 'google_signin_initiated',
    });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/resources',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        scopes:
          'openid email profile https://www.googleapis.com/auth/drive.metadata.readonly',
      },
    });

    if (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleDriveButtonClick = () => {
    trackEvent('resources_access_granted', {
      page: '/resources',
      action: 'drive_button_clicked',
      email: user?.email,
    });
  };

  // Simplified: just two cases
  const renderContent = () => {
    // Case 1: Authenticated - Show all PGI resources
    if (isPGIMember === true) {
      return (
        <div>
          <motion.div variants={itemFadeIn}>
            <BentoFolderGrid parentFolderId={DRIVE_FOLDER_ID} />
          </motion.div>

          <motion.div className="text-center mt-12" variants={itemFadeIn}>
            <a
              href={DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDriveButtonClick}
              className="inline-flex items-center bg-pgi-light-blue text-white px-6 py-3 rounded-lg font-semibold text-base shadow-lg hover:brightness-110 transition"
            >
              <ExternalLinkIcon className="w-4 h-4 mr-2" />
              View Full Drive Folder
            </a>
          </motion.div>
        </div>
      );
    }

    // Case 2: Not authenticated - Show public resources + sign in options
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemFadeIn}>
          <PlaceholderBentoGrid />
        </motion.div>

        <motion.div
          className="text-center max-w-6xl mx-auto mt-16"
          variants={itemFadeIn}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* PGI Members */}
            <motion.div
              className="bg-darkNavy p-8 md:p-10 rounded-xl border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 shadow-xl"
              variants={itemFadeIn}
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-navy"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H11V21H5V19H9V17H5V15H11V13H5V11H9V9H5V7H9V5H5V3H13V9H21Z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white">
                  PGI Members
                </h3>
              </div>

              <p className="text-gray-300 mb-8 text-base font-light leading-relaxed">
                Sign in with your university email to access exclusive
                resources, research materials, and educational content.
              </p>
              <button
                onClick={handleSignIn}
                className="w-full bg-pgi-light-blue text-white py-4 px-8 rounded-lg font-semibold text-base shadow-lg hover:brightness-110 transition flex items-center justify-center"
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
                Member Sign In
              </button>
            </motion.div>

            {/* Interested Non-Members */}
            <motion.div
              className="bg-darkNavy p-8 md:p-10 rounded-xl border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 shadow-xl"
              variants={itemFadeIn}
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-full mr-4">
                  <svg
                    className="w-6 h-6 text-navy"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white">
                  Stay Updated
                </h3>
              </div>

              <p className="text-gray-300 mb-8 text-base font-light leading-relaxed">
                Not a PGI member? Get notified about opportunities, events, and
                updates from our community.
              </p>

              <NewsletterSignup source="resources_page_public" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };

  const PlaceholderBentoGrid = () => {
    const shouldCenterLast = PLACEHOLDER_FOLDERS.length % 3 === 1;

    return (
      <div className="w-full max-w-7xl mx-auto mb-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          variants={staggerContainer}
        >
          {PLACEHOLDER_FOLDERS.map((folder, index) => {
            const Icon = folder.icon;
            const isLastItem = index === PLACEHOLDER_FOLDERS.length - 1;
            const isOnlyItemInRow = shouldCenterLast && isLastItem;

            return (
              <motion.div
                key={folder.id}
                className={`bg-darkNavy p-6 rounded-xl border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 shadow-xl relative ${
                  isOnlyItemInRow ? 'lg:col-start-2' : ''
                }`}
                variants={itemFadeIn}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
              >
                {/* Lock overlay */}
                <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-2 border border-gray-600">
                  <LockIcon className="w-4 h-4 text-gray-400" />
                </div>

                {/* Icon */}
                <div className="bg-pgi-light-blue p-3 rounded-full mb-4 w-fit">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-white font-medium text-lg mb-2 line-clamp-2">
                  {folder.name}
                </h3>

                {folder.description && (
                  <p className="text-gray-300 text-sm font-light leading-relaxed line-clamp-3 mb-4">
                    {folder.description}
                  </p>
                )}

                {/* Preview label */}
                <div className="mt-auto pt-4 border-t border-gray-700">
                  <span className="text-xs text-gray-400 font-medium">
                    Preview Only
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-pgi-dark-blue text-white min-h-screen flex items-center justify-center">
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
    <div className="bg-pgi-dark-blue text-white min-h-screen">
      <motion.main
        className="py-20 md:py-28 lg:py-32 px-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        role="main"
        aria-label="PGI Resources Page"
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div className="text-center mb-16" variants={fadeIn}>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 text-white">
              <ShinyText
                text={
                  isPGIMember === true
                    ? 'PGI Internal Resources'
                    : 'Our Resources'
                }
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              {isPGIMember === true
                ? 'Access your exclusive PGI educational materials and research resources.'
                : 'Explore our collection of investment and finance resources.'}
            </p>
          </motion.div>

          {/* Authentication and Content Section */}
          <motion.div className="w-full" variants={fadeIn}>
            {renderContent()}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
