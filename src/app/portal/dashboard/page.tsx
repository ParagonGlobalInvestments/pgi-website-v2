'use client';

import { useState, useEffect } from 'react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { useNewsRefresh } from '@/contexts/NewsRefreshContext';
import { isDevOrEnabled } from '@/lib/featureFlags';
import Link from 'next/link';
import {
  FaBriefcase,
  FaUsers,
  FaArrowRight,
  FaBuilding,
  FaGraduationCap,
  FaUniversity,
  FaChartPie,
  FaClock,
  FaSync,
} from 'react-icons/fa';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { motion } from 'framer-motion';
import { SmoothTransition } from '@/components/ui/SmoothTransition';
import MarketWatchNews from '@/components/dashboard/MarketWatchNews';
import SeekingAlphaNews from '@/components/dashboard/SeekingAlphaNews';
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  delay?: number;
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  color,
  bgColor,
  delay = 0,
}: StatCardProps) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl text-blue-950 font-bold mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className={`p-4 rounded-full ${bgColor} shadow-md`}>{icon}</div>
    </div>
  </motion.div>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
  delay?: number;
}

const ActionCard = ({
  title,
  description,
  icon,
  href,
  color,
  bgColor,
  delay = 0,
}: ActionCardProps) => (
  <motion.div
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link href={href} className="block">
      <div
        className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 ${color} hover:shadow-xl transition-all group`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-4 rounded-full ${bgColor} shadow-md`}>{icon}</div>
          <motion.div
            animate={{ x: 0 }}
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <FaArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </motion.div>
        </div>
        <h3 className="font-semibold text-xl text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </div>
    </Link>
  </motion.div>
);

// News Refresh Timer Component
const NewsRefreshTimer = () => {
  const { timeUntilRefresh, lastRefreshed, isRefreshing, triggerRefresh } =
    useNewsRefresh();

  const minutes = Math.floor(timeUntilRefresh / 60);
  const seconds = timeUntilRefresh % 60;

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffInSeconds < 86400) {
      const hrs = Math.floor(diffInSeconds / 3600);
      return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <FaClock className={`${isRefreshing ? 'animate-pulse' : ''}`} />
          <span className="font-medium">
            {isRefreshing ? (
              'Refreshing news...'
            ) : (
              <>
                Feed will auto-refresh in:{' '}
                <span className="font-mono">
                  {String(minutes).padStart(2, '0')}:
                  {String(seconds).padStart(2, '0')}
                </span>
              </>
            )}
          </span>
        </div>
        {lastRefreshed && !isRefreshing && (
          <span className="text-xs text-blue-600">
            Last updated {formatRelativeTime(lastRefreshed)}
          </span>
        )}
      </div>
      <button
        onClick={() => triggerRefresh()}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh news now"
      >
        <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh Now</span>
      </button>
    </motion.div>
  );
};

export default function Dashboard() {
  const { user: supabaseUserData, isLoading: isSupabaseUserLoading } =
    useSupabaseUser();
  const [stats, setStats] = useState({
    internships: 0,
    members: 0,
    chapters: 0,
    loading: true,
  });

  // Check if user just completed onboarding by checking URL query parameter
  const [justCompletedOnboarding, setJustCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if there's a query parameter indicating onboarding completion
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('onboarded') === 'true') {
        setJustCompletedOnboarding(true);

        // Remove the query parameter after 5 seconds
        setTimeout(() => {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }, 5000);
      }
    }
  }, []);

  // Fetch real data from the API
  useEffect(() => {
    if (!supabaseUserData) return;

    const fetchStats = async () => {
      try {
        // Fetch internship count
        let internshipStats = { total: 0 };
        let memberStats = { totalMembers: 0, totalChapters: 0 };

        try {
          const internshipsResponse = await fetch('/api/internships/stats');
          if (internshipsResponse.ok) {
            internshipStats = await internshipsResponse.json();
          }
        } catch (error) {
          console.warn('Internship stats API not available yet:', error);
          // Fallback to counting from regular endpoint
          try {
            const fallbackResponse = await fetch('/api/internships');
            if (fallbackResponse.ok) {
              const internships = await fallbackResponse.json();
              internshipStats = { total: internships.length };
            }
          } catch (fallbackError) {
            console.error('Fallback internship count failed:', fallbackError);
          }
        }

        // Fetch member and chapter count
        try {
          const membersResponse = await fetch('/api/users/stats');
          if (membersResponse.ok) {
            memberStats = await membersResponse.json();
          }
        } catch (error) {
          console.warn('User stats API not available yet:', error);
          // Use hardcoded fallback
          memberStats = {
            totalMembers: 45,
            totalChapters: 8,
          };
        }

        setStats({
          internships: internshipStats.total || 0,
          members: memberStats.totalMembers || 0,
          chapters: memberStats.totalChapters || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use fallback values
        setStats({
          internships: 24,
          members: 45,
          chapters: 8,
          loading: false,
        });
      }
    };

    fetchStats();
  }, [supabaseUserData]);

  // Get user data from Supabase
  const userRole = supabaseUserData?.org_permission_level || 'member';
  const userTrack = supabaseUserData?.org_track || 'N/A';
  const trackRoles = supabaseUserData?.org_track_roles || [];
  const primaryRole = trackRoles.length > 0 ? trackRoles[0] : null;
  const chapter = supabaseUserData?.org_chapter_name || 'N/A';

  // Get formatted track name for display
  const getFormattedTrack = (track: string) => {
    switch (track) {
      case 'quant':
        return 'Quantitative Investing';
      case 'value':
        return 'Value Investing';
      default:
        return 'N/A';
    }
  };

  // Get formatted role name for display
  const getFormattedRole = (role: string) => {
    switch (role) {
      case 'QuantitativeAnalyst':
        return 'Quantitative Analyst';
      case 'QuantitativeResearchCommittee':
        return 'Quantitative Research Committee';
      case 'ValueAnalyst':
        return 'Value Analyst';
      case 'InvestmentCommittee':
        return 'Investment Committee';
      case 'PortfolioManager':
        return 'Portfolio Manager';
      default:
        return role;
    }
  };

  // ProtectedPage handles auth checks, so we only need to check if data is loading
  if (isSupabaseUserLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user data after loading, show error
  if (!supabaseUserData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-red-500">
          <p>Unable to load user data. Please try refreshing the page.</p>
          <p className="text-sm text-gray-500 mt-2">
            If the issue persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPage>
      <SmoothTransition
        isVisible={true}
        direction="vertical"
        className="space-y-8 pt-4 lg:pt-0 text-navy"
      >
        {justCompletedOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  Welcome to Paragon Global Investments! Your profile is now
                  complete.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold"
          >
            Welcome back,{' '}
            {supabaseUserData?.personal_name?.split(' ')[0] || 'Member'}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-1 space-y-1"
          >
            {userRole === 'admin' ? (
              <p className="text-gray-500">
                Here's an overview of Paragon Global Investments
              </p>
            ) : (
              <div className="flex flex-row gap-2">
                <div className="flex items-center gap-2">
                  <FaUniversity className="text-blue-600" />
                  <span className="text-gray-700 font-medium">{chapter}</span>
                </div>

                {userTrack !== 'N/A' && (
                  <div className="flex items-center gap-2">
                    <FaChartPie
                      className={
                        userTrack === 'quant'
                          ? 'text-blue-600'
                          : 'text-purple-600'
                      }
                    />
                    <span className="text-gray-700">
                      {getFormattedTrack(userTrack)}
                    </span>
                  </div>
                )}

                {primaryRole && (
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className="text-green-600" />
                    <span className="text-gray-700">
                      {getFormattedRole(primaryRole)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions - Shown at top on mobile */}
        <div className="lg:hidden">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl font-semibold text-gray-800 mb-4"
          >
            Quick Actions
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4"
          >
            {/* Hide Internships in production */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <ActionCard
                  title="Browse Internships"
                  description="View all available internship opportunities"
                  icon={<FaBriefcase className="text-white text-xl" />}
                  href="/portal/dashboard/internships"
                  color="border-blue-100"
                  bgColor="bg-blue-500"
                  delay={0.5}
                />

                {(userRole === 'admin' || userRole === 'lead') && (
                  <ActionCard
                    title="Add New Internship"
                    description="Post a new internship opportunity"
                    icon={<FaBriefcase className="text-white text-xl" />}
                    href="/portal/dashboard/internships/new"
                    color="border-green-100"
                    bgColor="bg-green-500"
                    delay={0.6}
                  />
                )}
              </>
            )}

            <ActionCard
              title="View Members"
              description="See all members in the network"
              icon={<FaUsers className="text-white text-xl" />}
              href="/portal/dashboard/directory"
              color="border-purple-100"
              bgColor="bg-purple-500"
              delay={0.7}
            />

            {/* Settings Action */}
            <ActionCard
              title="Update Profile"
              description="Edit your profile information"
              icon={<FaGraduationCap className="text-white text-xl" />}
              href="/portal/dashboard/settings"
              color="border-amber-100"
              bgColor="bg-amber-500"
              delay={0.8}
            />
          </motion.div>
        </div>

        {/* Stats Cards - Only show in dev or when feature flag enabled */}
        {isDevOrEnabled('showStats') && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:grid lg:grid-cols-3 gap-6"
          >
            {/* Internships stat - only if internships feature enabled */}
            {isDevOrEnabled('enableInternships') && (
              <StatCard
                title="Available Internships"
                value={stats.loading ? '...' : stats.internships}
                icon={<FaBriefcase className="text-white text-xl" />}
                description={
                  stats.loading
                    ? 'Loading...'
                    : `${stats.internships} current opportunities`
                }
                color="border-blue-500"
                bgColor="bg-blue-500"
                delay={0.1}
              />
            )}

            {(userRole === 'admin' || userRole === 'lead') && (
              <StatCard
                title="Total Members"
                value={stats.loading ? '...' : stats.members}
                icon={<FaUsers className="text-white text-xl" />}
                description={
                  stats.loading
                    ? 'Loading...'
                    : `${stats.members} members across all chapters`
                }
                color="border-green-500"
                bgColor="bg-green-500"
                delay={0.2}
              />
            )}

            {userRole === 'admin' && (
              <StatCard
                title="Active Chapters"
                value={stats.loading ? '...' : stats.chapters}
                icon={<FaBuilding className="text-white text-xl" />}
                description={
                  stats.loading
                    ? 'Loading...'
                    : `Across ${stats.chapters} universities`
                }
                color="border-amber-500"
                bgColor="bg-amber-500"
                delay={0.3}
              />
            )}
          </motion.div>
        )}

        {/* News and Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Watch News Feed */}
          <div className="lg:col-span-2">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl font-semibold text-gray-800 mb-4"
            >
              News & Updates
            </motion.h2>
            <NewsRefreshTimer />

            <div className="flex lg:flex-row flex-col gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="lg:w-1/2"
              >
                <MarketWatchNews />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="lg:w-1/2"
              >
                <SeekingAlphaNews />
              </motion.div>
            </div>
          </div>

          {/* Quick Actions - Only shown on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl font-semibold text-gray-800 mb-4"
            >
              Quick Actions
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6"
            >
              {/* Internships - Only show in dev or when feature flag enabled */}
              {isDevOrEnabled('enableInternships') && (
                <>
                  <ActionCard
                    title="Browse Internships"
                    description="View all available internship opportunities"
                    icon={<FaBriefcase className="text-white text-xl" />}
                    href="/portal/dashboard/internships"
                    color="border-blue-100"
                    bgColor="bg-blue-500"
                    delay={0.5}
                  />

                  {(userRole === 'admin' || userRole === 'lead') && (
                    <ActionCard
                      title="Add New Internship"
                      description="Post a new internship opportunity"
                      icon={<FaBriefcase className="text-white text-xl" />}
                      href="/portal/dashboard/internships/new"
                      color="border-green-100"
                      bgColor="bg-green-500"
                      delay={0.6}
                    />
                  )}
                </>
              )}

              {/* User Profile Summary Card if user has profile data */}
              {(supabaseUserData?.personal_bio ||
                supabaseUserData?.personal_major ||
                (supabaseUserData?.profile_skills &&
                  supabaseUserData?.profile_skills.length > 0)) && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.9 }}
                  className="bg-white p-5 rounded-xl shadow-md border border-gray-100 mt-4"
                >
                  <h3 className="font-medium text-gray-800 mb-2">
                    Your Profile
                  </h3>

                  {supabaseUserData?.personal_major && (
                    <div className="flex items-start gap-2 mb-2">
                      <FaGraduationCap className="text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {supabaseUserData.personal_major}
                      </span>
                    </div>
                  )}

                  {supabaseUserData?.personal_grad_year && (
                    <div className="flex items-start gap-2 mb-2">
                      <FaUniversity className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        Class of {supabaseUserData.personal_grad_year}
                      </span>
                    </div>
                  )}

                  {supabaseUserData?.personal_bio && (
                    <div className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {supabaseUserData.personal_bio}
                    </div>
                  )}

                  {supabaseUserData?.profile_skills &&
                    supabaseUserData.profile_skills.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Skills</div>
                        <div className="flex flex-wrap gap-1">
                          {supabaseUserData.profile_skills
                            .slice(0, 3)
                            .map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          {supabaseUserData.profile_skills.length > 3 && (
                            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                              +{supabaseUserData.profile_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </SmoothTransition>
    </ProtectedPage>
  );
}
