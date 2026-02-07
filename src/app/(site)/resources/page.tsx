'use client';

import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/posthog';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import { toast } from 'sonner';
import {
  BookOpenIcon,
  TrendingUpIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  LockIcon,
} from 'lucide-react';
import { fadeIn, staggerContainer, itemFadeIn } from '@/lib/animations';

const PLACEHOLDER_FOLDERS = [
  {
    id: 'placeholder-1',
    name: 'Educational Materials',
    icon: BookOpenIcon,
    description: 'Access comprehensive learning resources',
  },
  {
    id: 'placeholder-2',
    name: 'Investment Research',
    icon: TrendingUpIcon,
    description: 'Market analysis and research templates',
  },
  {
    id: 'placeholder-3',
    name: 'Training Resources',
    icon: GraduationCapIcon,
    description: 'Professional development materials',
  },
  {
    id: 'placeholder-4',
    name: 'Career Resources',
    icon: BriefcaseIcon,
    description: 'Career guidance and opportunities',
  },
];

function ResourcesPageContent() {
  const [loading, setLoading] = useState(true);
  const [isPGIMember, setIsPGIMember] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams?.get('notMember') === 'true') {
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
      window.history.replaceState({}, '', '/resources');
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUserStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            // Member — redirect them to the portal resources page
            setIsPGIMember(true);
            window.location.href = '/portal/resources';
            return;
          } else {
            await supabase.auth.signOut();
          }
        } catch {
          await supabase.auth.signOut();
        }
      }

      setLoading(false);
    };
    checkUserStatus();
  }, [supabase]);

  const handleLogin = () => {
    trackEvent('resources_cta_clicked', {
      page: '/resources',
      action: 'google_signin_initiated',
    });

    // OAuth callback must stay on the same origin where signInWithOAuth is called,
    // because Supabase stores the PKCE code_verifier in a cookie bound to this domain.
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/portal/resources')}`;

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' },
        scopes: 'openid email profile',
      },
    });
  };

  if (loading || isPGIMember) {
    return (
      <div className="bg-pgi-dark-blue text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
          <p className="text-gray-300">Loading resources page...</p>
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
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div className="text-center mb-16" variants={fadeIn}>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 text-white">
              <ShinyText
                text="Our Resources"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Explore our collection of investment and finance resources. Log in
              as a PGI member to access the full library.
            </p>
          </motion.div>

          {/* Resource cards - 2x2 balanced grid */}
          <motion.div
            className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {PLACEHOLDER_FOLDERS.map(folder => {
              const Icon = folder.icon;
              return (
                <motion.div
                  key={folder.id}
                  className="group bg-gradient-to-br from-darkNavy to-darkNavy/80 p-6 md:p-8 rounded-2xl border border-gray-700/50 hover:border-pgi-light-blue/50 transition-all duration-300 shadow-lg hover:shadow-pgi-light-blue/10 relative overflow-hidden"
                  variants={itemFadeIn}
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pgi-light-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Lock badge */}
                  <div className="absolute top-4 right-4 bg-gray-800/60 backdrop-blur-sm rounded-full p-2 border border-gray-600/50">
                    <LockIcon className="w-3.5 h-3.5 text-gray-400" />
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <div className="bg-pgi-light-blue/90 p-3.5 rounded-xl mb-5 w-fit shadow-lg shadow-pgi-light-blue/20">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-medium text-lg md:text-xl mb-2">
                      {folder.name}
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed">
                      {folder.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="relative mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                      Members Only
                    </span>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-pgi-light-blue/50 to-transparent rounded-full" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Login CTA */}
          <motion.div className="text-center mt-12" variants={itemFadeIn}>
            <button
              onClick={handleLogin}
              className="inline-flex items-center bg-pgi-light-blue text-white px-6 py-3 rounded-lg font-semibold text-base shadow-lg hover:brightness-110 transition"
            >
              Log in to access resources
            </button>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-pgi-dark-blue text-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
            <p className="text-gray-300">Loading resources page...</p>
          </div>
        </div>
      }
    >
      <ResourcesPageContent />
    </Suspense>
  );
}
