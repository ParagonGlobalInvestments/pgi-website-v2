'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
  FaBriefcase,
  FaUsers,
  FaCog,
  FaHome,
  FaChevronLeft,
  FaGraduationCap,
  FaRocket,
  FaNewspaper,
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useMongoUser } from '@/hooks/useMongoUser';
import { MdDashboard } from 'react-icons/md';
// Import shadcn components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SmoothTransition } from '@/components/ui/SmoothTransition';
import OnboardingWizard from '@/components/auth/OnboardingWizard';
import { toast } from '@/components/ui/use-toast';
import { needsOnboarding } from '@/components/auth/OnboardingWizard';

// Map chapter names to their logo filenames
const universityLogoMap: { [key: string]: string } = {
  'Princeton University': 'princeton.png',
  'Brown University': 'brown.png',
  'Columbia University': 'columbia.png',
  'Yale University': 'yale.png',
  'University of Pennsylvania': 'upenn.png',
  'New York University': 'nyu.png',
  'University of Chicago': 'uchicago.png',
  'Cornell University': 'cornell.png',
};

// Helper function to get the logo path
const getUniversityLogoPath = (chapterName: string): string => {
  const logoFile = universityLogoMap[chapterName];
  return logoFile ? `/images/universities/${logoFile}` : '';
};

/**
 * Props for the NavItem component
 */
interface NavItemProps {
  /** URL path for the navigation link */
  href: string;
  /** Icon React element to display */
  icon: React.ReactNode;
  /** Text label for the navigation item */
  label: string;
  /** Whether this item is currently active */
  isActive: boolean;
  /** Click handler function */
  onClick: () => void;
  /** Optional count badge to display */
  count?: number;
  /** Whether the sidebar is in collapsed state */
  isCollapsed: boolean;
}

/**
 * Navigation item component for sidebar
 *
 * Renders a navigation link with icon, label, and optional count badge
 * Responsive to sidebar collapsed state
 */
const NavItem = ({
  href,
  icon,
  label,
  isActive,
  onClick,
  count,
  isCollapsed,
}: NavItemProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} onClick={onClick} className="w-full">
          <Button
            variant={isActive ? 'navy-accent' : 'ghost'}
            className={`w-full ${
              isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
            } transition-all duration-200 relative text-gray-300 hover:text-white`}
          >
            <span className={`text-sm ${isCollapsed ? 'mx-0' : 'mr-3'}`}>
              {icon}
            </span>
            {!isCollapsed && <span className="text-sm">{label}</span>}
            {!isCollapsed && count !== undefined && (
              <span className="ml-auto bg-[#003E6B] text-xs px-1.5 py-0.5 rounded-md font-medium">
                {count}
              </span>
            )}
            {isCollapsed && count !== undefined && (
              <span className="absolute -top-1 -right-1 bg-[#003E6B] text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                {count}
              </span>
            )}
          </Button>
        </Link>
      </TooltipTrigger>
      {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  </TooltipProvider>
);

interface Chapter {
  _id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

// Add these animation variants near the top with other animation definitions
const mobileNavVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      staggerChildren: 0.1,
    },
  },
};

const mobileNavItemVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Update the OnboardingBanner component to use FaRocket icon instead of emoji
const OnboardingBanner = ({
  onStartOnboarding,
  isCollapsed,
}: {
  onStartOnboarding: () => void;
  isCollapsed: boolean;
}) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className={`${
      isCollapsed
        ? 'bg-transparent text-blue-600'
        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
    } border-b ${isCollapsed ? 'border-none' : 'border-blue-800'}`}
  >
    <div
      className={`mx-auto px-4 pt-4 pb-3 flex items-center ${
        !isCollapsed ? 'justify-between' : 'justify-end gap-2'
      }`}
    >
      <div className="flex items-center space-x-2">
        <FaRocket
          className={`${
            isCollapsed ? 'text-blue-500/80' : 'text-white'
          } text-lg`}
        />
        <span className="text-sm font-medium">
          Complete your profile setup to access all features
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={onStartOnboarding}
        className={`${
          isCollapsed
            ? 'bg-blue-500/50 hover:bg-blue-500/30 text-white'
            : 'bg-white/20 hover:bg-white/30 text-white'
        } border-0`}
      >
        Finish Profile
      </Button>
    </div>
  </motion.div>
);

// Keep the MongoUserData type for the checkOnboardingNeeded function
interface MongoUserData {
  id: string;
  name?: string;
  email?: string;
  permissionLevel?: string;
  track?: string;
  trackRole?: string;
  chapter?: {
    name: string;
    id: string;
    slug: string;
    logoUrl: string;
  };
  skills?: string[];
  bio?: string;
  major?: string;
  gradYear?: number;
  isAlumni?: boolean;
}

// Add type safety for the useMongoUser hook result
type MongoUserWithNestedStructure = {
  id: string;
  personal?: {
    name?: string;
    email?: string;
    bio?: string;
    major?: string;
    gradYear?: number;
    isAlumni?: boolean;
    phone?: string;
  };
  org?: {
    chapter?: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string;
    };
    permissionLevel?: 'admin' | 'lead' | 'member';
    track?: 'quant' | 'value';
    trackRoles?: string[];
    execRoles?: string[];
    joinDate?: string;
    status?: 'active' | 'inactive' | 'pending';
  };
  profile?: {
    skills?: string[];
    linkedin?: string;
    resumeUrl?: string;
    avatarUrl?: string;
    github?: string;
    interests?: string[];
    achievements?: string[];
    projects?: any[];
    experiences?: any[];
  };
  activity?: {
    lastLogin?: string;
    internshipsPosted?: number;
  };
  system?: {
    firstLogin: boolean;
    notifications?: {
      email: boolean;
      platform: boolean;
    };
  };
  createdAt?: string;
  updatedAt?: string;
};

// Update the checkOnboardingNeeded function to handle both types
const checkOnboardingNeeded = (
  mongoUser: MongoUserWithNestedStructure | MongoUserData | null
) => {
  if (!mongoUser) return true;

  // First check if firstLogin is explicitly true (takes precedence)
  if (
    'system' in mongoUser &&
    mongoUser.system &&
    mongoUser.system.firstLogin === true
  ) {
    console.log('User needs onboarding because firstLogin is true');
    return true;
  }

  // Check if it's the nested structure or flat structure
  if ('personal' in mongoUser && mongoUser.personal) {
    // It's a nested structure
    return needsOnboarding({
      track: mongoUser.org?.track,
      trackRole: mongoUser.org?.trackRoles?.[0],
      chapter: mongoUser.org?.chapter?.name,
      major: mongoUser.personal.major,
      gradYear: mongoUser.personal.gradYear,
      skills: mongoUser.profile?.skills,
      bio: mongoUser.personal.bio,
    });
  } else {
    // It's a flat structure (MongoUserData)
    return needsOnboarding({
      track: (mongoUser as MongoUserData).track,
      trackRole: (mongoUser as MongoUserData).trackRole,
      chapter: (mongoUser as MongoUserData).chapter?.name,
      major: (mongoUser as MongoUserData).major,
      gradYear: (mongoUser as MongoUserData).gradYear,
      skills: (mongoUser as MongoUserData).skills,
      bio: (mongoUser as MongoUserData).bio,
    });
  }
};

// Add a helper function to safely display user data
const safeDisplayValue = (
  value: string | undefined,
  fallback: string = 'Not set'
): string => {
  if (!value || value === 'N/A' || value === 'undefined') return fallback;
  return value;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeLink, setActiveLink] = useState('dashboard');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [internships, setInternships] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoaded } = useUser();
  const {
    user: mongoUser,
    isLoading: isMongoUserLoading,
    syncUser,
  } = useMongoUser();

  // Replace direct state initialization with null
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Add state for client-side rendering
  const [isClient, setIsClient] = useState(false);

  // Add state for sidebar hover
  const [isHoveringCollapsed, setIsHoveringCollapsed] = useState(false);

  // Add effect for Escape key to close onboarding modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOnboardingWizard) {
        setShowOnboardingWizard(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showOnboardingWizard]);

  // Set isClient to true after mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update needsOnboarding when mongoUser changes
  useEffect(() => {
    if (isLoaded && user && !isMongoUserLoading && mongoUser) {
      setNeedsOnboarding(checkOnboardingNeeded(mongoUser));
    }
  }, [isLoaded, user, mongoUser, isMongoUserLoading]);

  // Sync Clerk user with MongoDB on initial load - only once
  useEffect(() => {
    if (isLoaded && user && !syncAttempted && !mongoUser) {
      setSyncAttempted(true);

      // Only sync once per session
      const syncUserOnce = async () => {
        try {
          await syncUser();
          console.log('User synced successfully');
        } catch (err) {
          console.error('Failed to sync user with MongoDB:', err);
          // No retry - we've already set syncAttempted to true
        }
      };

      syncUserOnce();
    }
  }, [isLoaded, user, syncUser, mongoUser, syncAttempted]);

  // Get user metadata once loaded
  const userRole = (user?.publicMetadata?.role as string) || 'member';
  const userTrack = (user?.publicMetadata?.track as string) || 'N/A';
  const userChapter = (user?.publicMetadata?.chapter as string) || 'N/A';

  // Get role icon with proper type checking
  const getRoleIcon = (role: string | undefined) => {
    switch (role) {
      case 'admin':
        return <FaRocket className="text-yellow-400" />;
      case 'lead':
        return <FaGraduationCap className="text-green-400" />;
      default:
        return <FaUsers className="text-blue-400" />;
    }
  };

  // Get track color with proper type checking
  const getTrackColor = (track: string | undefined) => {
    switch (track) {
      case 'quant':
        return 'text-blue-400';
      case 'value':
        return 'text-purple-400';
      case 'both':
        return 'text-teal-400';
      default:
        return 'text-gray-400';
    }
  };

  // Fetch chapters and internships with proper typing and error handling
  useEffect(() => {
    // Only fetch if user is loaded and we haven't already loaded chapters
    if (isLoaded && chapters.length === 0) {
      const fetchData = async () => {
        try {
          // Fetch chapters
          const chaptersResponse = await fetch('/api/chapters');
          if (chaptersResponse.ok) {
            const chaptersData = await chaptersResponse.json();
            setChapters(chaptersData);

            // Set the selected chapter based on user's chapter or default to first one
            const userChapterObject = chaptersData.find(
              (ch: Chapter) => ch.name === userChapter
            );
            setSelectedChapter(userChapterObject || chaptersData[0] || null);
          }

          // Fetch internships
          const internshipsResponse = await fetch('/api/internships');
          if (internshipsResponse.ok) {
            const internshipsData = await internshipsResponse.json();
            setInternships(internshipsData);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [isLoaded, chapters.length, userChapter]);

  useEffect(() => {
    // Set active link based on URL
    const path = window.location.pathname;
    if (path.includes('/internships')) {
      setActiveLink('internships');
    } else if (path.includes('/directory')) {
      setActiveLink('directory');
    } else if (path.includes('/settings')) {
      setActiveLink('settings');
    } else {
      setActiveLink('dashboard');
    }
  }, []);

  // Add mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add useEffect to handle mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Add new useEffect for fetching user count
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch('/api/users/stats');
        if (response.ok) {
          const data = await response.json();
          setUserCount(data.activeMembers); // Using activeMembers count (non-alumni)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    if (isLoaded) {
      fetchUserStats();
    }
  }, [isLoaded]);

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    try {
      // Refresh user data with forced refresh
      await syncUser({
        system: {
          firstLogin: false,
        },
      });

      // Force re-fetch from API to update UI
      const refreshResponse = await fetch('/api/users/me', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store' },
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.user) {
          console.log('Successfully refreshed user data after onboarding');
        }
      }

      setNeedsOnboarding(false);
      setShowOnboardingWizard(false);

      // Force UI to recognize changes by adding a slight delay
      setTimeout(() => {
        window.location.reload(); // Force full page refresh to update all components
      }, 500);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Keep the onboarding state if there was an error
      toast({
        title: 'Error completing onboarding',
        description:
          'Please try again or contact support if the issue persists.',
        variant: 'destructive',
      });
    }
  };

  // Create a loading state that waits for client-side rendering
  if (!isClient || !isLoaded) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 min-w-0 bg-white lg:ml-0">
          <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding wizard if explicitly shown or needed on first load
  if (showOnboardingWizard || (needsOnboarding && !syncAttempted)) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        userData={{
          track: mongoUser?.org?.track,
          trackRole: mongoUser?.org?.trackRoles?.[0],
          chapter: mongoUser?.org?.chapter?.name,
          major: mongoUser?.personal?.major,
          gradYear: mongoUser?.personal?.gradYear,
          skills: mongoUser?.profile?.skills,
          bio: mongoUser?.personal?.bio,
        }}
      />
    );
  }

  // Update displayName, displayRole, etc. to reference the correct MongoUser interface type and handle incomplete data
  const displayName =
    mongoUser?.personal?.name ||
    (user ? `${user.firstName || ''} ${user.lastName || ''}` : '');
  const displayRole = mongoUser?.org?.permissionLevel || userRole;
  const displayTrack = mongoUser?.org?.track || userTrack;
  const displayChapter =
    mongoUser?.org?.chapter?.name || selectedChapter?.name || userChapter;
  const displayAvatar = mongoUser?.profile?.avatarUrl || user?.imageUrl;

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Is data complete enough to show
  const hasCompleteData =
    !needsOnboarding &&
    mongoUser?.system?.firstLogin !== true &&
    displayChapter &&
    displayChapter !== 'N/A' &&
    displayTrack &&
    displayTrack !== 'N/A';

  // OnboardingWizard userData needs to use the correct fields from the nested structure
  const onboardingUserData = {
    track: mongoUser?.org?.track,
    trackRole: mongoUser?.org?.trackRoles?.[0], // Get first track role as primary
    chapter: mongoUser?.org?.chapter?.name,
    major: mongoUser?.personal?.major,
    gradYear: mongoUser?.personal?.gradYear,
    skills: mongoUser?.profile?.skills,
    bio: mongoUser?.personal?.bio,
  };

  // Updated sidebar width animation with transparent collapsed state
  const sidebarVariants = {
    expanded: {
      width: '16rem',
      backgroundColor: '#00172B',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    collapsed: {
      width: '4.5rem',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    hovering: {
      width: '4.5rem',
      backgroundColor: '#00172B',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  };

  // Icon animation variants
  const iconVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Mobile Navigation Bar */}
      <motion.div
        className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-[#00172B] border-b shadow-lg border-[#003E6B]"
        variants={mobileNavVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <motion.div
            className="flex items-center space-x-3"
            variants={mobileNavItemVariants}
          >
            <Image
              src="/logos/pgiLogoFull.jpg"
              alt="Paragon Global Investments"
              width={120}
              height={24}
              className="h-8 w-auto"
            />
          </motion.div>
          <motion.button
            variants={mobileNavItemVariants}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:bg-[#003E6B] rounded-md transition-colors relative z-50"
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#00172B] transition-transform duration-300 ease-in-out z-[55] ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        } pt-16`}
      >
        <div className="p-4">
          {/* User Profile Section */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-[#002C4D] rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-white font-medium">{displayName}</div>
              {hasCompleteData ? (
                <div className="text-sm text-gray-400">
                  {safeDisplayValue(displayChapter)}
                </div>
              ) : (
                <Button
                  variant="link"
                  size="sm"
                  className="px-0 text-blue-400 h-auto"
                  onClick={() => setShowOnboardingWizard(true)}
                >
                  Complete your profile
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/portal/dashboard"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === 'dashboard'
                  ? 'bg-[#003E6B]'
                  : 'hover:bg-[#002C4D]'
              }`}
              onClick={() => {
                setActiveLink('dashboard');
                setIsMobileMenuOpen(false);
              }}
            >
              <MdDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/portal/dashboard/internships"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === 'internships'
                  ? 'bg-[#003E6B]'
                  : 'hover:bg-[#002C4D]'
              }`}
              onClick={() => {
                setActiveLink('internships');
                setIsMobileMenuOpen(false);
              }}
            >
              <FaBriefcase className="h-5 w-5" />
              <span>Internships</span>
              {internships.length > 0 && (
                <span className="ml-auto bg-[#003E6B] text-xs px-2 py-1 rounded-full">
                  {internships.length}
                </span>
              )}
            </Link>
            <Link
              href="/portal/dashboard/directory"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === 'directory'
                  ? 'bg-[#003E6B]'
                  : 'hover:bg-[#002C4D]'
              }`}
              onClick={() => {
                setActiveLink('directory');
                setIsMobileMenuOpen(false);
              }}
            >
              <FaUsers className="h-5 w-5" />
              <span>Directory</span>
              {userCount > 0 && (
                <span className="ml-auto bg-[#003E6B] text-xs px-2 py-1 rounded-full">
                  {userCount}
                </span>
              )}
            </Link>
            <Link
              href="/portal/dashboard/news"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === 'news' ? 'bg-[#003E6B]' : 'hover:bg-[#002C4D]'
              }`}
              onClick={() => {
                setActiveLink('news');
                setIsMobileMenuOpen(false);
              }}
            >
              <FaNewspaper className="h-5 w-5" />
              <span>News</span>
            </Link>
            <Link
              href="/portal/dashboard/settings"
              className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                activeLink === 'settings'
                  ? 'bg-[#003E6B]'
                  : 'hover:bg-[#002C4D]'
              }`}
              onClick={() => {
                setActiveLink('settings');
                setIsMobileMenuOpen(false);
              }}
            >
              <FaCog className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* User Metadata - Only show if data is complete */}
          {hasCompleteData ? (
            <div className="mt-6 p-4 bg-[#002C4D] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getRoleIcon(displayRole)}
                <span className="text-sm font-medium text-white capitalize">
                  {safeDisplayValue(displayRole)}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Track:{' '}
                <span className={`font-medium ${getTrackColor(displayTrack)}`}>
                  {safeDisplayValue(displayTrack)}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-[#002C4D] rounded-lg">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
                onClick={() => setShowOnboardingWizard(true)}
              >
                Complete Profile Setup
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Set up your chapter, track, and other details
              </p>
            </div>
          )}

          {/* Back to Website Link */}
          <div className="mt-6">
            <Link
              href="/"
              className="flex items-center space-x-3 px-3 py-3 rounded-md text-gray-400 hover:bg-[#002C4D]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHome className="h-5 w-5" />
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Hide on mobile */}
      <motion.aside
        className="hidden group lg:flex flex-shrink-0 flex-col h-screen sticky top-0 overflow-hidden z-50"
        variants={sidebarVariants}
        animate={
          isCollapsed
            ? isHoveringCollapsed
              ? 'hovering'
              : 'collapsed'
            : 'expanded'
        }
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onHoverStart={() => setIsHoveringCollapsed(true)}
        onHoverEnd={() => setIsHoveringCollapsed(false)}
      >
        {/* Organization Header */}
        <div className={`px-4 py-4 flex items-center justify-between`}>
          <SmoothTransition
            isVisible={!isCollapsed}
            direction="vertical"
            className="flex w-full items-center justify-between gap-2"
          >
            <div className="w-30 h-8 bg-primary rounded flex items-center justify-center">
              <Image
                src="/logos/pgiLogoFull.jpg"
                alt="Paragon Global Investments"
                width={250}
                height={40}
                className="w-auto"
              />
            </div>
          </SmoothTransition>

          <div className="flex items-center hover:cursor-pointer rounded-full">
            <SmoothTransition
              isVisible={isCollapsed}
              direction="scale"
              className="w-full"
            >
              <div
                className="w-8 h-8 rounded cursor-pointer"
                onClick={() => setIsCollapsed(false)}
              >
                <Image
                  src="/logos/pgiLogoTransparent.png"
                  alt="Paragon Global Investments"
                  width={32}
                  height={32}
                  className="w-auto group-hover:block hidden"
                />
                <Image
                  src="/logos/pgiLogoTransparentDark.png"
                  alt="Paragon Global Investments"
                  width={32}
                  height={32}
                  className="w-auto group-hover:hidden"
                />
              </div>
            </SmoothTransition>

            {!isCollapsed && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsCollapsed(true)}
                      variant="ghost"
                      size="icon"
                      className="text-white h-8 w-8 hover:cursor-pointer hover:text-white"
                      aria-label="Collapse Sidebar"
                    >
                      <FaChevronLeft size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Collapse Sidebar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Main Navigation - Moved up to replace the user account section */}
        <div className="px-3 mt-6 flex-1">
          {!isCollapsed && (
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Main
            </h2>
          )}
          <nav className="space-y-1">
            {/* Replace standard NavItem with animated version for collapsed state */}
            {isCollapsed ? (
              <>
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate={isHoveringCollapsed ? 'visible' : 'hidden'}
                >
                  <NavItem
                    href="/portal/dashboard"
                    icon={<MdDashboard />}
                    label="Dashboard"
                    isActive={activeLink === 'dashboard'}
                    onClick={() => setActiveLink('dashboard')}
                    isCollapsed={isCollapsed}
                  />
                </motion.div>
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate={isHoveringCollapsed ? 'visible' : 'hidden'}
                >
                  <NavItem
                    href="/portal/dashboard/internships"
                    icon={<FaBriefcase />}
                    label="Internships"
                    isActive={activeLink === 'internships'}
                    onClick={() => setActiveLink('internships')}
                    count={internships.length}
                    isCollapsed={isCollapsed}
                  />
                </motion.div>
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate={isHoveringCollapsed ? 'visible' : 'hidden'}
                >
                  <NavItem
                    href="/portal/dashboard/directory"
                    icon={<FaUsers />}
                    label="Directory"
                    isActive={activeLink === 'directory'}
                    onClick={() => setActiveLink('directory')}
                    count={userCount}
                    isCollapsed={isCollapsed}
                  />
                </motion.div>
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate={isHoveringCollapsed ? 'visible' : 'hidden'}
                >
                  <NavItem
                    href="/portal/dashboard/news"
                    icon={<FaNewspaper />}
                    label="News"
                    isActive={activeLink === 'news'}
                    onClick={() => setActiveLink('news')}
                    isCollapsed={isCollapsed}
                  />
                </motion.div>
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate={isHoveringCollapsed ? 'visible' : 'hidden'}
                >
                  <NavItem
                    href="/portal/dashboard/settings"
                    icon={<FaCog />}
                    label="Settings"
                    isActive={activeLink === 'settings'}
                    onClick={() => setActiveLink('settings')}
                    isCollapsed={isCollapsed}
                  />
                </motion.div>
              </>
            ) : (
              <>
                <NavItem
                  href="/portal/dashboard"
                  icon={<MdDashboard />}
                  label="Dashboard"
                  isActive={activeLink === 'dashboard'}
                  onClick={() => setActiveLink('dashboard')}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  href="/portal/dashboard/internships"
                  icon={<FaBriefcase />}
                  label="Internships"
                  isActive={activeLink === 'internships'}
                  onClick={() => setActiveLink('internships')}
                  count={internships.length}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  href="/portal/dashboard/directory"
                  icon={<FaUsers />}
                  label="Directory"
                  isActive={activeLink === 'directory'}
                  onClick={() => setActiveLink('directory')}
                  count={userCount}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  href="/portal/dashboard/news"
                  icon={<FaNewspaper />}
                  label="News"
                  isActive={activeLink === 'news'}
                  onClick={() => setActiveLink('news')}
                  isCollapsed={isCollapsed}
                />
                <NavItem
                  href="/portal/dashboard/settings"
                  icon={<FaCog />}
                  label="Settings"
                  isActive={activeLink === 'settings'}
                  onClick={() => setActiveLink('settings')}
                  isCollapsed={isCollapsed}
                />
              </>
            )}
          </nav>
        </div>

        {/* User Integrated Profile Section - Combines all user data in one place at the bottom */}
        <div className="mt-auto border-t border-[#003E6B]">
          {hasCompleteData ? (
            // Complete profile view
            <SmoothTransition
              isVisible={!isCollapsed}
              direction="vertical"
              className="px-4 py-4 mx-3 my-3 bg-[#002C4D] rounded-md border border-[#003E6B]/50 shadow-inner"
            >
              <div className="flex items-center gap-3 mb-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                      <AvatarImage src={displayAvatar} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a
                        href="#"
                        onClick={() =>
                          window.open(
                            'https://accounts.clerk.dev/user/user_profile',
                            '_blank'
                          )
                        }
                      >
                        Profile Settings
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/portal/dashboard/settings">
                        App Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/portal/signout" className="text-red-500">
                        Sign Out
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex-1">
                  <div className="font-medium text-white">{displayName}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    {getRoleIcon(displayRole)}
                    <span className="capitalize">
                      {safeDisplayValue(displayRole)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Track:</span>
                  <span
                    className={`font-medium ${getTrackColor(displayTrack)}`}
                  >
                    {safeDisplayValue(displayTrack)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Chapter:</span>
                  <div className="flex items-center gap-1">
                    {universityLogoMap[displayChapter] && (
                      <div className="w-4 h-4 bg-white rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                          src={getUniversityLogoPath(displayChapter)}
                          alt={`${displayChapter} logo`}
                          width={16}
                          height={16}
                          className="w-3 h-3 object-contain"
                        />
                      </div>
                    )}
                    <span className="font-medium text-blue-300">
                      {safeDisplayValue(displayChapter)}
                    </span>
                  </div>
                </div>
              </div>
            </SmoothTransition>
          ) : (
            // Incomplete profile view
            <SmoothTransition
              isVisible={!isCollapsed}
              direction="vertical"
              className="px-4 py-4 mx-3 my-3 bg-[#002C4D] rounded-md border border-[#003E6B]/50 shadow-inner"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-white">{displayName}</div>
                  <div className="text-xs text-gray-400">
                    Profile incomplete
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
                onClick={() => setShowOnboardingWizard(true)}
              >
                Complete Profile
              </Button>
            </SmoothTransition>
          )}

          {/* Collapsed state profile display */}
          {isCollapsed && (
            <motion.div
              variants={iconVariants}
              initial="hidden"
              animate={isHoveringCollapsed ? 'visible' : 'hidden'}
              className="py-4 mt-auto mx-auto flex flex-col items-center gap-3"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                          <AvatarImage src={displayAvatar} alt={displayName} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a
                            href="#"
                            onClick={() =>
                              window.open(
                                'https://accounts.clerk.dev/user/user_profile',
                                '_blank'
                              )
                            }
                          >
                            Profile Settings
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/portal/dashboard/settings">
                            App Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/portal/signout" className="text-red-500">
                            Sign Out
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="right">{displayName}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {hasCompleteData ? (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-7 h-7 rounded-full bg-[#002C4D] flex items-center justify-center">
                          {getRoleIcon(displayRole)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {safeDisplayValue(displayRole)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {universityLogoMap[displayChapter] && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
                            <Image
                              src={getUniversityLogoPath(displayChapter)}
                              alt={`${displayChapter} logo`}
                              width={20}
                              height={20}
                              className="w-4 h-4 object-contain"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {safeDisplayValue(displayChapter)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setShowOnboardingWizard(true)}
                        size="icon"
                        className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center"
                      >
                        <FaRocket className="text-white" size={10} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Complete your profile
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </motion.div>
          )}

          {/* Footer Navigation */}
          <div className="px-3 py-3 border-t border-[#003E6B] mt-2">
            {isCollapsed ? (
              // Collapsed footer
              <motion.div
                variants={iconVariants}
                initial="hidden"
                animate={isHoveringCollapsed ? 'visible' : 'hidden'}
                className="flex flex-col items-center gap-3"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/" className="w-full block">
                        <Button
                          variant="ghost"
                          className="text-gray-300 hover:text-white hover:bg-[#003E6B] w-9 h-9 p-0 flex items-center justify-center rounded-full"
                        >
                          <FaHome />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Back to Website
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            ) : (
              // Expanded footer
              <Link href="/" className="w-full block">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-[#003E6B] w-full justify-start px-3"
                >
                  <FaHome className="mr-2" />
                  <span>Back to Website</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content - Add padding top on mobile and adjust for absolute positioned sidebar */}
      <div className="flex-1 min-w-0 bg-white">
        {needsOnboarding && (
          <OnboardingBanner
            onStartOnboarding={() => setShowOnboardingWizard(true)}
            isCollapsed={isCollapsed}
          />
        )}
        <div className="lg:p-8 p-4 pt-16 lg:pt-8">{children}</div>
      </div>

      {/* Onboarding Wizard Modal Overlay */}
      <AnimatePresence>
        {showOnboardingWizard && (
          <>
            {/* Backdrop overlay with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />

            {/* Modal container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center z-[80] p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
                <OnboardingWizard
                  onComplete={handleOnboardingComplete}
                  userData={onboardingUserData}
                  lightTheme={true}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
