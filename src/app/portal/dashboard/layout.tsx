'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/browser';
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
  FaChartLine,
  FaUserTie,
} from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { MdDashboard } from 'react-icons/md';
import { NewsRefreshProvider } from '@/contexts/NewsRefreshContext';
import { isDevOrEnabled } from '@/lib/featureFlags';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Chapter {
  _id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
  isCollapsed: boolean;
}

interface ProfileCompletionBannerProps {
  onCompleteProfile: () => void;
  isCollapsed: boolean;
  completionPercentage: number;
  missingFields: string[];
  isComplete: boolean;
  displayName?: string;
  displayExecRole?: string | null;
  displayPermissionLevel?: string;
  displayTrack?: string;
  displayChapter?: string;
  displayMajor?: string;
  displayGradYear?: string;
  displayAvatar?: string;
  initials?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  activeLink: string;
  setActiveLink: (link: string) => void;
  onClose: () => void;
  displayAvatar: string;
  displayName: string;
  displayChapter: string;
  initials: string;
  hasCompleteData: boolean;
  internships: any[];
  userCount: number;
  displayTrack: string;
  displayExecRole: string | null;
  displayPermissionLevel: string;
  onShowOnboarding: () => void;
}

interface DesktopSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  activeLink: string;
  setActiveLink: (link: string) => void;
  internships: any[];
  userCount: number;
  hasCompleteData: boolean;
  displayAvatar: string;
  displayName: string;
  displayChapter: string;
  displayTrack: string;
  displayExecRole: string | null;
  displayPermissionLevel: string;
  initials: string;
  onShowOnboarding: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const UNIVERSITY_LOGO_MAP: { [key: string]: string } = {
  'Princeton University': 'princeton.png',
  'Brown University': 'brown.png',
  'Columbia University': 'columbia.png',
  'Yale University': 'yale.png',
  'University of Pennsylvania': 'upenn.png',
  'New York University': 'nyu.png',
  'University of Chicago': 'uchicago.png',
  'Cornell University': 'cornell.png',
};

const MOBILE_NAV_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.1 },
  },
};

const MOBILE_NAV_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const SIDEBAR_VARIANTS = {
  expanded: {
    width: '16rem',
    backgroundColor: '#00172B',
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  collapsed: {
    width: '4.5rem',
    backgroundColor: '#00172B',
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getUniversityLogoPath = (chapterName: string): string => {
  const logoFile = UNIVERSITY_LOGO_MAP[chapterName];
  return logoFile ? `/images/universities/${logoFile}` : '';
};

const safeDisplayValue = (
  value: string | undefined,
  fallback: string = 'Not set'
): string => {
  if (!value || value === 'N/A' || value === 'undefined') return fallback;
  return value;
};

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

const getTrackColor = (track: string | undefined) => {
  switch (track) {
    case 'quant':
      return 'text-blue-600';
    case 'value':
      return 'text-purple-600';
    case 'both':
      return 'text-teal-400';
    default:
      return 'text-gray-400';
  }
};

// Role display formatting (matches directory page)
const getRoleDisplayName = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: 'Admin',
    lead: 'Chapter Lead',
    member: 'Member',
  };
  return roleMap[role] || role;
};

const getExecRoleDisplayName = (role: string) => {
  const roleMap: Record<string, string> = {
    chairman: 'Chairman',
    ceo: 'Chief Executive Officer',
    coo: 'Chief Operating Officer',
    cio: 'Chief Investment Officer',
    cqr: 'Chief Quantitative Researcher',
    cto: 'Chief Technology Officer',
    'Chapter Founder': 'Founder',
    Founder: 'PGI Founder',
    'Alumni Board': 'Alumni Board',
  };
  return roleMap[role.toLowerCase()] || roleMap[role] || role;
};

const getFormattedRole = (execRole: string | null, permissionLevel: string) => {
  if (execRole) {
    return getExecRoleDisplayName(execRole);
  }
  return getRoleDisplayName(permissionLevel);
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

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
              <span className="absolute -top-1 -right-1 bg-blue-600 text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
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

const ProfileCompletionBanner = ({
  onCompleteProfile,
  isCollapsed,
  completionPercentage,
  missingFields,
  isComplete,
  displayName,
  displayExecRole,
  displayPermissionLevel,
  displayTrack,
  displayChapter,
  displayMajor,
  displayGradYear,
  displayAvatar,
  initials,
}: ProfileCompletionBannerProps) => {
  if (isComplete) {
    // Complete profile view - show user info
    return (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="sticky top-16 lg:top-0 z-40 bg-gradient-to-r from-slate-50 to-gray-50 border-y sm:border-b border-gray-200 shadow-sm"
      >
        <div className="mx-auto px-4 py-3">
          {/* Desktop view */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                    {displayName || 'User'}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span
                      className={`capitalize font-medium ${getTrackColor(displayTrack)}`}
                    >
                      {displayTrack}
                    </span>
                    {' / '}
                    <span className="font-medium">
                      {getFormattedRole(
                        displayExecRole,
                        displayPermissionLevel
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-400 mx-2" />
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {displayChapter}
                    </span>
                    <span
                      className={`text-xs px-2 rounded font-medium ${
                        displayPermissionLevel === 'admin'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : displayPermissionLevel === 'lead'
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {displayPermissionLevel?.toUpperCase()}
                    </span>
                  </div>
                  {displayMajor && displayGradYear && (
                    <span className="text-xs font-medium text-gray-500">
                      {displayMajor} {' / '} {displayGradYear}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">
                  Profile Complete
                </span>
              </div>
            </div>
          </div>

          {/* Mobile view - compact */}
          <div className="flex lg:hidden items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                  {displayName || 'User'}
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span className={`capitalize ${getTrackColor(displayTrack)}`}>
                    {displayTrack}
                  </span>
                  {' / '}
                  <span>
                    {getFormattedRole(displayExecRole, displayPermissionLevel)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 rounded-full flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium text-green-700">
                Complete
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Incomplete profile view - show completion progress
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={`sticky top-16 lg:top-0 z-40 ${
        isCollapsed
          ? 'bg-blue-50 text-blue-900'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
      } border-b ${isCollapsed ? 'border-blue-200' : 'border-blue-800'} shadow-sm`}
    >
      <div
        className={`mx-auto px-4 py-3 flex items-center ${
          !isCollapsed ? 'justify-between' : 'justify-end gap-2'
        } flex-wrap gap-2`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FaRocket
            className={`${isCollapsed ? 'text-blue-600' : 'text-white'} text-base flex-shrink-0`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">
                {completionPercentage}% Complete
              </span>
              <div className="hidden sm:flex items-center gap-1 text-xs opacity-90">
                <span>·</span>
                <span>
                  {missingFields.length} field
                  {missingFields.length !== 1 ? 's' : ''} remaining
                </span>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden max-w-xs">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${isCollapsed ? 'bg-blue-600' : 'bg-white'}`}
              />
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onCompleteProfile}
          className={`${
            isCollapsed
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'
          } border-0 flex-shrink-0`}
        >
          Complete Profile
        </Button>
      </div>
    </motion.div>
  );
};

const MobileNavLink = ({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
  count,
}: {
  href: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}) => (
  <Link
    href={href}
    className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
      isActive ? 'bg-[#003E6B]' : 'hover:bg-[#002C4D]'
    }`}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
    {count !== undefined && count > 0 && (
      <span className="ml-auto bg-[#003E6B] text-xs px-2 py-1 rounded-full">
        {count}
      </span>
    )}
  </Link>
);

const MobileMenu = ({
  isOpen,
  activeLink,
  setActiveLink,
  onClose,
  displayAvatar,
  displayName,
  displayChapter,
  initials,
  hasCompleteData,
  internships,
  userCount,
  displayTrack,
  displayExecRole,
  displayPermissionLevel,
  onShowOnboarding,
}: MobileMenuProps) => (
  <div
    className={`fixed inset-0 bg-[#00172B] transition-transform duration-300 ease-in-out z-[55] ${
      isOpen ? 'translate-y-0' : '-translate-y-full'
    } pt-16`}
  >
    <div className="p-4">
      {/* User Profile Section */}
      <div className="flex items-center space-x-3 mb-4 p-3 bg-[#002C4D] rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarImage src={displayAvatar} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="text-white font-medium">{displayName}</div>
          {hasCompleteData ? (
            <div className="text-xs text-gray-400">
              {safeDisplayValue(displayChapter)}
            </div>
          ) : (
            <Button
              variant="link"
              size="sm"
              className="px-0 text-blue-400 h-auto"
              onClick={onShowOnboarding}
            >
              Complete your profile
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1 text-sm">
        <MobileNavLink
          href="/portal/dashboard"
          icon={MdDashboard}
          label="Dashboard"
          isActive={activeLink === 'dashboard'}
          onClick={() => {
            setActiveLink('dashboard');
            onClose();
          }}
        />
        {isDevOrEnabled('enableInternships') && (
          <MobileNavLink
            href="/portal/dashboard/internships"
            icon={FaBriefcase}
            label="Internships"
            isActive={activeLink === 'internships'}
            onClick={() => {
              setActiveLink('internships');
              onClose();
            }}
            count={internships.length}
          />
        )}
        {isDevOrEnabled('enableDirectory') && (
          <MobileNavLink
            href="/portal/dashboard/directory"
            icon={FaUsers}
            label="Directory"
            isActive={activeLink === 'directory'}
            onClick={() => {
              setActiveLink('directory');
              onClose();
            }}
            count={userCount}
          />
        )}
        <MobileNavLink
          href="/portal/dashboard/pitches"
          icon={FaChartLine}
          label="Pitches"
          isActive={activeLink === 'pitches'}
          onClick={() => {
            setActiveLink('pitches');
            onClose();
          }}
        />
        <MobileNavLink
          href="/portal/dashboard/education"
          icon={FaGraduationCap}
          label="Education"
          isActive={activeLink === 'education'}
          onClick={() => {
            setActiveLink('education');
            onClose();
          }}
        />
        <MobileNavLink
          href="/portal/dashboard/recruitment"
          icon={FaUserTie}
          label="Recruitment"
          isActive={activeLink === 'recruitment'}
          onClick={() => {
            setActiveLink('recruitment');
            onClose();
          }}
        />
        <MobileNavLink
          href="/portal/dashboard/news"
          icon={FaNewspaper}
          label="News"
          isActive={activeLink === 'news'}
          onClick={() => {
            setActiveLink('news');
            onClose();
          }}
        />
        <MobileNavLink
          href="/portal/dashboard/settings"
          icon={FaCog}
          label="Settings"
          isActive={activeLink === 'settings'}
          onClick={() => {
            setActiveLink('settings');
            onClose();
          }}
        />
      </nav>

      {/* Back to Website Link */}
      <div className="mt-6">
        <Link
          href="/"
          className="flex items-center text-sm space-x-3 px-3 py-3 rounded-md text-gray-400 hover:bg-[#002C4D]"
          onClick={onClose}
        >
          <FaHome className="h-5 w-5" />
          <span>Back to Website</span>
        </Link>
      </div>
    </div>
  </div>
);

const UserProfileSection = ({
  isCollapsed,
  hasCompleteData,
  displayAvatar,
  displayName,
  initials,
  displayTrack,
  displayRole,
  displayChapter,
  onShowOnboarding,
}: {
  isCollapsed: boolean;
  hasCompleteData: boolean;
  displayAvatar: string;
  displayName: string;
  initials: string;
  displayTrack: string;
  displayRole: string;
  displayChapter: string;
  onShowOnboarding: () => void;
}) => {
  if (!isCollapsed) {
    return (
      <SmoothTransition
        isVisible={!isCollapsed}
        direction="vertical"
        className="px-4 py-4 mx-3 my-3 bg-[#002C4D] rounded-md border border-[#003E6B]/50 shadow-inner"
      >
        {hasCompleteData ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                    <AvatarImage src={displayAvatar} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/portal/signout"
                      className="text-red-500 w-full"
                    >
                      Sign Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-1">
                <div className="font-medium text-white">{displayName}</div>
                <div className="text-xs text-gray-400 flex flex-row items-center gap-2">
                  {safeDisplayValue(displayTrack)}
                  {' / '}
                  {safeDisplayValue(displayRole)}
                </div>
              </div>
            </div>
            <div className="flex text-xs items-center justify-between">
              <span className="font-medium text-blue-300 mr-2">
                {safeDisplayValue(displayChapter)}
              </span>
              {UNIVERSITY_LOGO_MAP[displayChapter] && (
                <div className="w-5 h-5 bg-white rounded-full overflow-hidden flex items-center justify-center">
                  <Image
                    src={getUniversityLogoPath(displayChapter)}
                    alt={`${displayChapter} logo`}
                    width={24}
                    height={24}
                    className="w-5 h-5 object-contain"
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-white">{displayName}</div>
                <div className="text-xs text-gray-400">Profile incomplete</div>
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
              onClick={onShowOnboarding}
            >
              Complete Profile
            </Button>
          </>
        )}
      </SmoothTransition>
    );
  }

  // Collapsed state
  return (
    <div className="py-4 mt-auto mx-auto flex flex-col items-center gap-3">
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
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href="/portal/signout" className="text-red-500 w-full">
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

          {UNIVERSITY_LOGO_MAP[displayChapter] && (
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
                onClick={onShowOnboarding}
                size="icon"
                className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center"
              >
                <FaRocket className="text-white" size={10} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Complete your profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

const DesktopSidebar = ({
  isCollapsed,
  setIsCollapsed,
  activeLink,
  setActiveLink,
  internships,
  userCount,
  hasCompleteData,
  displayAvatar,
  displayName,
  displayChapter,
  displayTrack,
  displayExecRole,
  displayPermissionLevel,
  initials,
  onShowOnboarding,
}: DesktopSidebarProps) => (
  <motion.aside
    className="hidden lg:flex flex-shrink-0 flex-col h-screen sticky top-0 overflow-hidden z-50"
    variants={SIDEBAR_VARIANTS}
    animate={isCollapsed ? 'collapsed' : 'expanded'}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    {/* Organization Header */}
    <div className="px-4 py-4 flex items-center justify-between">
      <SmoothTransition
        isVisible={!isCollapsed}
        direction="vertical"
        className="flex w-full items-center mt-2 justify-between gap-2"
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
              className="w-auto"
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

    {/* Main Navigation */}
    <div className="px-3 mt-6 flex-1">
      {!isCollapsed && (
        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Main
        </h2>
      )}
      <nav className="space-y-1">
        <NavItem
          href="/portal/dashboard"
          icon={<MdDashboard />}
          label="Dashboard"
          isActive={activeLink === 'dashboard'}
          onClick={() => setActiveLink('dashboard')}
          isCollapsed={isCollapsed}
        />
        {isDevOrEnabled('enableInternships') && (
          <NavItem
            href="/portal/dashboard/internships"
            icon={<FaBriefcase />}
            label="Internships"
            isActive={activeLink === 'internships'}
            onClick={() => setActiveLink('internships')}
            count={internships.length}
            isCollapsed={isCollapsed}
          />
        )}
        {isDevOrEnabled('enableDirectory') && (
          <NavItem
            href="/portal/dashboard/directory"
            icon={<FaUsers />}
            label="Directory"
            isActive={activeLink === 'directory'}
            onClick={() => setActiveLink('directory')}
            count={userCount}
            isCollapsed={isCollapsed}
          />
        )}
        <NavItem
          href="/portal/dashboard/pitches"
          icon={<FaChartLine />}
          label="Pitches"
          isActive={activeLink === 'pitches'}
          onClick={() => setActiveLink('pitches')}
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/portal/dashboard/education"
          icon={<FaGraduationCap />}
          label="Education"
          isActive={activeLink === 'education'}
          onClick={() => setActiveLink('education')}
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/portal/dashboard/recruitment"
          icon={<FaUserTie />}
          label="Recruitment"
          isActive={activeLink === 'recruitment'}
          onClick={() => setActiveLink('recruitment')}
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
      </nav>
    </div>

    {/* User Profile Section */}
    {/* <UserProfileSection
        isCollapsed={isCollapsed}
        hasCompleteData={hasCompleteData}
        displayAvatar={displayAvatar}
        displayName={displayName}
        initials={initials}
        displayTrack={displayTrack}
        displayExecRole={displayExecRole}
        displayPermissionLevel={displayPermissionLevel}
        displayChapter={displayChapter}
        onShowOnboarding={onShowOnboarding}
      /> */}

    {/* Footer Navigation */}
    <div className="px-3 py-3 border-t border-[#003E6B] mt-2">
      {isCollapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/" className="w-full flex justify-center">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-[#003E6B] w-9 h-9 p-0 flex items-center justify-center rounded-full"
                >
                  <FaHome />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Back to Website</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
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
  </motion.aside>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { user: supabaseUserData, isLoading: isSupabaseUserLoading } =
    useSupabaseUser();

  // UI State
  const [activeLink, setActiveLink] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Data State
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [internships, setInternships] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  // Onboarding State
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check Supabase auth
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Handle Escape key for onboarding modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOnboardingWizard) {
        setShowOnboardingWizard(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showOnboardingWizard]);

  // Set active link based on URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/internships')) setActiveLink('internships');
    else if (path.includes('/directory')) setActiveLink('directory');
    else if (path.includes('/settings')) setActiveLink('settings');
    else setActiveLink('dashboard');
  }, []);

  // Handle mobile menu overflow
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Fetch chapters and internships
  useEffect(() => {
    if (!supabaseUser || chapters.length > 0) return;

    const fetchData = async () => {
      try {
        const [chaptersResponse, internshipsResponse] = await Promise.all([
          fetch('/api/chapters'),
          fetch('/api/internships'),
        ]);

        if (chaptersResponse.ok) {
          const chaptersData = await chaptersResponse.json();
          setChapters(chaptersData);
          const userChapter = supabaseUserData?.org_chapter_name;
          const userChapterObject = chaptersData.find(
            (ch: Chapter) => ch.name === userChapter
          );
          setSelectedChapter(userChapterObject || chaptersData[0] || null);
        }

        if (internshipsResponse.ok) {
          const internshipsData = await internshipsResponse.json();
          setInternships(internshipsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [supabaseUser, chapters.length, supabaseUserData?.org_chapter_name]);

  // Fetch user stats
  useEffect(() => {
    if (!supabaseUser) return;

    const fetchUserStats = async () => {
      try {
        const response = await fetch('/api/users/stats');
        if (response.ok) {
          const data = await response.json();
          setUserCount(data.activeMembers);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, [supabaseUser]);

  // Update onboarding status
  useEffect(() => {
    if (supabaseUser && !isSupabaseUserLoading && supabaseUserData) {
      const needsOnboard =
        !supabaseUserData.org_chapter_name || !supabaseUserData.org_track;
      setNeedsOnboarding(needsOnboard);
    }
  }, [supabaseUser, supabaseUserData, isSupabaseUserLoading]);

  // Mark sync as attempted
  useEffect(() => {
    if (supabaseUser && !syncAttempted && supabaseUserData) {
      setSyncAttempted(true);
    }
  }, [supabaseUser, supabaseUserData, syncAttempted]);

  // Auto-show onboarding wizard
  useEffect(() => {
    if (needsOnboarding && !syncAttempted && !showOnboardingWizard) {
      setShowOnboardingWizard(true);
    }
  }, [needsOnboarding, syncAttempted, showOnboardingWizard]);

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!supabaseUserData) return { percentage: 0, missingFields: [] };

    const fields = {
      track: supabaseUserData.org_track,
      chapter: supabaseUserData.org_chapter_name,
      major: supabaseUserData.personal_major,
      gradYear: supabaseUserData.personal_grad_year,
      skills: supabaseUserData.profile_skills?.length > 0,
      bio: supabaseUserData.personal_bio,
    };

    const missingFieldLabels = [];
    if (!fields.track) missingFieldLabels.push('Track role');
    if (!fields.chapter) missingFieldLabels.push('Chapter');
    if (!fields.major) missingFieldLabels.push('Major');
    if (!fields.gradYear) missingFieldLabels.push('Graduation year');
    if (!fields.skills) missingFieldLabels.push('Skills');
    if (!fields.bio) missingFieldLabels.push('Bio');

    const completed = Object.values(fields).filter(Boolean).length;
    const total = Object.keys(fields).length;
    const percentage = Math.round((completed / total) * 100);

    return { percentage, missingFields: missingFieldLabels };
  }, [supabaseUserData]);

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    try {
      setNeedsOnboarding(false);
      setShowOnboardingWizard(false);
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error completing onboarding',
        description:
          'Please try again or contact support if the issue persists.',
        variant: 'destructive',
      });
    }
  };

  // Derived display values
  const displayName =
    supabaseUserData?.personal_name ||
    supabaseUser?.user_metadata?.full_name ||
    supabaseUser?.email?.split('@')[0] ||
    '';
  const displayExecRole = supabaseUserData?.org_exec_roles?.[0] || null;
  const displayPermissionLevel =
    supabaseUserData?.org_permission_level || 'member';
  const displayTrack = supabaseUserData?.org_track || 'value';
  const displayChapter =
    supabaseUserData?.org_chapter_name || selectedChapter?.name || 'N/A';
  const displayAvatar = supabaseUser?.user_metadata?.avatar_url;
  const displayMajor = supabaseUserData?.personal_major;
  const displayGradYear = supabaseUserData?.personal_grad_year?.toString();

  const firstName = supabaseUser?.user_metadata?.full_name?.split(' ')[0] || '';
  const lastName =
    supabaseUser?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    supabaseUser?.email?.charAt(0).toUpperCase() ||
    'U';

  const hasCompleteData = Boolean(
    !needsOnboarding &&
      displayChapter &&
      displayChapter !== 'N/A' &&
      displayTrack &&
      displayTrack !== undefined
  );

  const hasIncompleteProfile = profileCompletion.percentage < 100;

  const onboardingUserData = {
    track: supabaseUserData?.org_track,
    trackRole: supabaseUserData?.org_track_roles?.[0],
    chapter: supabaseUserData?.org_chapter_name,
    major: supabaseUserData?.personal_major,
    gradYear: supabaseUserData?.personal_grad_year,
    skills: supabaseUserData?.profile_skills,
    bio: supabaseUserData?.personal_bio,
  };

  // Loading state
  if (!isClient || !supabaseUser) {
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

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Mobile Navigation Bar */}
      <motion.div
        className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-[#00172B] border-b shadow-lg border-[#003E6B]"
        variants={MOBILE_NAV_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <motion.div
            className="flex items-center space-x-3"
            variants={MOBILE_NAV_ITEM_VARIANTS}
          >
            <Image
              src="/logos/pgiLogoTransparent.png"
              alt="Paragon Global Investments"
              width={120}
              height={24}
              className="h-8 w-auto"
            />
          </motion.div>
          <motion.button
            variants={MOBILE_NAV_ITEM_VARIANTS}
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

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        onClose={() => setIsMobileMenuOpen(false)}
        displayAvatar={displayAvatar}
        displayName={displayName}
        displayChapter={displayChapter}
        initials={initials}
        hasCompleteData={hasCompleteData}
        internships={internships}
        userCount={userCount}
        displayTrack={displayTrack}
        displayExecRole={displayExecRole}
        displayPermissionLevel={displayPermissionLevel}
        onShowOnboarding={() => setShowOnboardingWizard(true)}
      />

      {/* Desktop Sidebar */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
        internships={internships}
        userCount={userCount}
        hasCompleteData={hasCompleteData}
        displayAvatar={displayAvatar}
        displayName={displayName}
        displayChapter={displayChapter}
        displayTrack={displayTrack}
        displayExecRole={displayExecRole}
        displayPermissionLevel={displayPermissionLevel}
        initials={initials}
        onShowOnboarding={() => setShowOnboardingWizard(true)}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-white">
        <ProfileCompletionBanner
          onCompleteProfile={() => {
            if (needsOnboarding) {
              setShowOnboardingWizard(true);
            } else {
              window.location.href = '/portal/dashboard/settings';
            }
          }}
          isCollapsed={isCollapsed}
          completionPercentage={profileCompletion.percentage}
          missingFields={profileCompletion.missingFields}
          isComplete={!hasIncompleteProfile}
          displayName={displayName}
          displayExecRole={displayExecRole}
          displayPermissionLevel={displayPermissionLevel}
          displayTrack={displayTrack}
          displayChapter={displayChapter}
          displayMajor={displayMajor}
          displayGradYear={displayGradYear}
          displayAvatar={displayAvatar}
          initials={initials}
        />
        <div className="lg:p-8 p-4 pt-2 lg:pt-8">
          <NewsRefreshProvider>{children}</NewsRefreshProvider>
        </div>
      </div>

      {/* Onboarding Wizard Modal */}
      <AnimatePresence>
        {showOnboardingWizard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-[80] p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
