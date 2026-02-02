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

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
          onClick: () => { window.location.href = '/apply#interest-form'; },
        },
      });
      window.history.replaceState({}, '', '/resources');
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            // Member — redirect them to the portal resources page
            setIsPGIMember(true);
            window.location.href = '/portal/dashboard/resources';
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
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/portal/dashboard/resources')}`;

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { access_type: 'offline', prompt: 'consent' },
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
              Explore our collection of investment and finance resources.
              Log in as a PGI member to access the full library.
            </p>
          </motion.div>

          {/* Placeholder cards */}
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              variants={staggerContainer}
            >
              {PLACEHOLDER_FOLDERS.map((folder, index) => {
                const Icon = folder.icon;
                const isLast = index === PLACEHOLDER_FOLDERS.length - 1;
                const isAlone = PLACEHOLDER_FOLDERS.length % 3 === 1 && isLast;

                return (
                  <motion.div
                    key={folder.id}
                    className={`bg-darkNavy p-6 rounded-xl border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 shadow-xl relative ${
                      isAlone ? 'lg:col-start-2' : ''
                    }`}
                    variants={itemFadeIn}
                    whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
                  >
                    <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-2 border border-gray-600">
                      <LockIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="bg-pgi-light-blue p-3 rounded-full mb-4 w-fit">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-medium text-lg mb-2">{folder.name}</h3>
                    <p className="text-gray-300 text-sm font-light leading-relaxed mb-4">
                      {folder.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-700">
                      <span className="text-xs text-gray-400 font-medium">Members Only</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

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
