'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Home,
  Users,
  FolderOpen,
  PenSquare,
  BarChart3,
  Settings,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { usePortalTransition, usePortalExit } from '@/lib/portal-transitions';
import { EASING, NAVY, LAYOUT } from '@/lib/portal-transitions/config';
import { usePortalUser } from '@/hooks/usePortalUser';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SmoothTransition } from '@/components/ui/SmoothTransition';
import { PortalMobileNav } from '@/components/portal/PortalMobileNav';
import { MockModeIndicator } from '@/components/portal/MockModeIndicator';
import { PortalLoadingSkeleton } from '@/components/portal/PortalLoadingSkeleton';
import {
  NAV_ITEMS,
  SETTINGS_NAV_ITEM,
  SCHOOL_LABELS,
  ROLE_LABELS,
  SITE_URL,
} from '@/components/portal/constants';
import type { PortalUserInfo } from '@/components/portal/types';
import type { User as AuthUser } from '@supabase/supabase-js';

/** Easing shorthand */
const easing = EASING.smooth;

/** Memoized spring config for nav indicator */
const navIndicatorTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
} as const;

/** Icon mapping for nav items */
const NAV_ICONS: Record<string, React.ElementType> = {
  Home,
  Users,
  FolderOpen,
  PenSquare,
  BarChart3,
  Settings,
};

/**
 * NavItem component for sidebar navigation
 */
const NavItem = memo(function NavItem({
  href,
  label,
  icon,
  isActive,
  isAdminOnly,
  onClick,
  isCollapsed,
  index,
  shouldAnimate,
}: {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
  isAdminOnly: boolean;
  onClick: () => void;
  isCollapsed: boolean;
  index: number;
  shouldAnimate: boolean;
}) {
  const transition = useMemo(
    () => ({
      duration: 0.3,
      delay: shouldAnimate ? 0.3 + index * 0.05 : 0,
      ease: easing,
    }),
    [shouldAnimate, index]
  );

  const Icon = NAV_ICONS[icon];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} onClick={onClick} className="w-full block">
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: -10 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={transition}
            className={`relative flex items-center gap-3 rounded-md text-sm transition-colors duration-200 ${
              isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            } ${
              isActive
                ? 'text-white font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            {isActive && (
              <>
                <motion.span
                  layoutId="nav-indicator"
                  className={`absolute top-0 bottom-0 w-[3px] rounded-full ${
                    isCollapsed ? '-left-2' : '-left-0.5'
                  }`}
                  style={{
                    background:
                      'linear-gradient(180deg, #5B8DEF 0%, #3A6BD5 100%)',
                    boxShadow: '0 0 8px rgba(74,107,177,0.5)',
                  }}
                  transition={navIndicatorTransition}
                />
                <motion.span
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-white/[0.07] rounded-lg -z-10"
                  transition={navIndicatorTransition}
                />
              </>
            )}
            {Icon && <Icon size={18} className="flex-shrink-0" />}
            {!isCollapsed && (
              <>
                <span className="flex-1">{label}</span>
                {isAdminOnly && (
                  <span className="text-[9px] font-medium tracking-wide text-amber-400/70 uppercase">
                    Admin
                  </span>
                )}
              </>
            )}
          </motion.div>
        </Link>
      </TooltipTrigger>
      {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
});

/**
 * Login panel content - centered logo only
 */
function LoginPanelContent({ showLogo }: { showLogo: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        animate={{ opacity: showLogo ? 1 : 0 }}
        transition={{ duration: 0.25, ease: easing }}
      >
        <Image
          src="/logos/pgiLogo.jpg"
          alt="Paragon Global Investments"
          width={110}
          height={40}
          className="w-auto"
          priority
        />
      </motion.div>
    </div>
  );
}

/**
 * Sidebar content - logo, nav, user info, footer
 */
function SidebarContent({
  activeLink,
  onLinkClick,
  isCollapsed,
  onCollapseToggle,
  navItems,
  userInfo,
  shouldAnimate,
  onBackToWebsite,
}: {
  activeLink: string;
  onLinkClick: (linkId: string) => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  navItems: typeof NAV_ITEMS;
  userInfo: PortalUserInfo | null;
  shouldAnimate: boolean;
  onBackToWebsite: (e: React.MouseEvent) => void;
}) {
  return (
    <>
      {/* Logo + collapse */}
      <div className="px-4 py-4 flex items-center justify-between">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.4,
            delay: shouldAnimate ? 0.1 : 0,
            ease: easing,
          }}
        >
          <SmoothTransition
            isVisible={!isCollapsed}
            direction="vertical"
            className="flex w-full items-center mt-2 justify-between gap-2"
          >
            <Image
              src="/logos/pgiLogoFull.jpg"
              alt="PGI"
              width={250}
              height={40}
              className="w-auto"
            />
          </SmoothTransition>
        </motion.div>

        <div className="flex items-center rounded-full">
          <SmoothTransition
            isVisible={isCollapsed}
            direction="scale"
            className="w-full"
          >
            <button
              type="button"
              className="w-8 h-8 rounded cursor-pointer"
              onClick={onCollapseToggle}
              aria-label="Expand sidebar"
            >
              <Image
                src="/logos/pgiLogoTransparent.png"
                alt="PGI"
                width={32}
                height={32}
                className="w-auto"
              />
            </button>
          </SmoothTransition>

          {!isCollapsed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onCollapseToggle}
                    variant="ghost"
                    size="icon"
                    className="text-white h-8 w-8 hover:text-white"
                  >
                    <ChevronLeft size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Nav items */}
      <TooltipProvider>
        <div className="px-3 mt-6 flex-1">
          {!isCollapsed && (
            <motion.h2
              initial={shouldAnimate ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: shouldAnimate ? 0.25 : 0 }}
              className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
            >
              Main
            </motion.h2>
          )}
          <nav className="space-y-0.5">
            {navItems.map((item, index) => (
              <NavItem
                key={item.id}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={activeLink === item.id}
                isAdminOnly={item.adminOnly}
                onClick={() => onLinkClick(item.id)}
                isCollapsed={isCollapsed}
                index={index}
                shouldAnimate={shouldAnimate}
              />
            ))}
          </nav>
        </div>

        {/* Settings */}
        <div className="px-3 mb-1">
          <NavItem
            href={SETTINGS_NAV_ITEM.href}
            label={SETTINGS_NAV_ITEM.label}
            icon={SETTINGS_NAV_ITEM.icon}
            isActive={activeLink === SETTINGS_NAV_ITEM.id}
            isAdminOnly={false}
            onClick={() => onLinkClick(SETTINGS_NAV_ITEM.id)}
            isCollapsed={isCollapsed}
            index={navItems.length}
            shouldAnimate={shouldAnimate}
          />
        </div>
      </TooltipProvider>

      {/* User section */}
      {!isCollapsed && userInfo && (
        <UserCard userInfo={userInfo} shouldAnimate={shouldAnimate} />
      )}

      {/* Footer */}
      <SidebarFooter
        isCollapsed={isCollapsed}
        shouldAnimate={shouldAnimate}
        onBackToWebsite={onBackToWebsite}
      />
    </>
  );
}

/**
 * Sidebar footer with Back to Website and Log Out
 */
function SidebarFooter({
  isCollapsed,
  shouldAnimate,
  onBackToWebsite,
}: {
  isCollapsed: boolean;
  shouldAnimate: boolean;
  onBackToWebsite: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: shouldAnimate ? 0.6 : 0 }}
      className="px-3 py-3 border-t border-navy-border/50 space-y-0.5"
    >
      {isCollapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onBackToWebsite}
                className="flex items-center justify-center text-gray-400 hover:text-gray-200 py-2 rounded-md text-[10px] font-medium uppercase tracking-wide w-full"
              >
                Exit
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Back to Website</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          <button
            onClick={onBackToWebsite}
            className="block w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-md"
          >
            Back to Website
          </button>
          <Link
            href="/portal/logout"
            className="block px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-md"
          >
            Log Out
          </Link>
        </>
      )}
    </motion.div>
  );
}

/**
 * Program-based accent colors for user card
 */
const PROGRAM_COLORS = {
  quant: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    badgeBg: 'bg-blue-500',
  },
  value: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    badgeBg: 'bg-purple-500',
  },
  default: {
    border: 'border-navy-border/50',
    bg: '',
    text: 'text-gray-400',
    badgeBg: 'bg-gray-500',
  },
} as const;

/**
 * User card component
 */
function UserCard({
  userInfo,
  shouldAnimate,
}: {
  userInfo: PortalUserInfo;
  shouldAnimate: boolean;
}) {
  const colors = PROGRAM_COLORS[userInfo.program || 'default'];
  const displayRole =
    userInfo.role && !(userInfo.isAdmin && userInfo.role === 'Admin');

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: shouldAnimate ? 0.5 : 0,
        ease: easing,
      }}
      className={`relative px-4 py-3 mx-3 mb-3 bg-navy-accent rounded-lg border-2 ${colors.border}`}
    >
      {userInfo.program && (
        <span
          className={`absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-bl-lg rounded-tr-[calc(0.5rem-2px)] text-white ${colors.badgeBg}`}
        >
          {userInfo.program === 'value' ? 'Value' : 'Quant'}
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className="font-medium text-white text-sm">{userInfo.name}</span>
        {userInfo.isAdmin && (
          <span className="text-[10px] font-medium tracking-wide text-amber-400/80 uppercase">
            Admin
          </span>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">
        {userInfo.school}
        {displayRole && (
          <>
            <span className="mx-1.5 text-gray-600">·</span>
            {userInfo.role}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Shell Component
// ─────────────────────────────────────────────────────────────

export function UnifiedPortalShell({
  children,
  initialMode = 'login',
}: {
  children: React.ReactNode;
  initialMode?: 'login' | 'dashboard';
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const { tag, flow } = usePortalTransition();
  const { handleExit } = usePortalExit();

  // Shell mode: 'login' | 'dashboard' — replaces old PortalShellContext mode
  const [mode, setMode] = useState<'login' | 'dashboard'>(initialMode);

  // UI state
  const [activeLink, setActiveLink] = useState('home');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const { user: portalUser } = usePortalUser(!!authUser);

  // Entrance animation flag (from Header portal button)
  const [showEntranceAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('entrance');
    }
    return false;
  });

  // Determine view mode
  const isMorphing =
    tag === 'morph' || (tag === 'complete' && flow === 'login:morph');
  const showLoginView = mode === 'login' && !isMorphing;
  const showDashboardView = isMorphing || mode === 'dashboard';

  // Sidebar entrance animation after morph
  const [shouldAnimateSidebar, setShouldAnimateSidebar] = useState(false);

  useEffect(() => setIsClient(true), []);

  // Transition mode from login→dashboard when morph completes
  useEffect(() => {
    if (tag === 'complete' && flow === 'login:morph') {
      setMode('dashboard');
    }
  }, [tag, flow]);

  // Clear entrance param from URL
  useEffect(() => {
    if (showEntranceAnimation && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('entrance')) {
        url.searchParams.delete('entrance');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [showEntranceAnimation]);

  // iOS safe-area background management
  const isExiting = flow === 'exit:logout' || flow === 'exit:back';
  const isLogoutRoute = pathname === '/portal/logout';
  const useNavyBg = showLoginView || isExiting || isLogoutRoute;
  useEffect(() => {
    const bgColor = useNavyBg ? NAVY.primary : '#ffffff';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, [useNavyBg]);

  // Auth state
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthUser(user);
      setAuthLoaded(true);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
      setAuthLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Reset to login when user signs out (only after auth has loaded at least once)
  useEffect(() => {
    if (authLoaded && !authUser && mode === 'dashboard') {
      setMode('login');
    }
  }, [authLoaded, authUser, mode]);

  // Sync active link with pathname
  useEffect(() => {
    if (!pathname) return;
    if (pathname.includes('/directory')) setActiveLink('directory');
    else if (pathname.includes('/resources')) setActiveLink('resources');
    else if (pathname.includes('/content')) setActiveLink('content');
    else if (pathname.includes('/observability'))
      setActiveLink('observability');
    else if (pathname.includes('/settings')) setActiveLink('settings');
    else setActiveLink('home');
  }, [pathname]);

  // Mobile menu body overflow
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Trigger sidebar animation after morph completes
  useEffect(() => {
    if (tag !== 'complete' || flow !== 'login:morph') return;
    setShouldAnimateSidebar(true);
    const timer = setTimeout(() => setShouldAnimateSidebar(false), 1000);
    return () => clearTimeout(timer);
  }, [tag, flow]);

  // Filter nav items by role
  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter(item => !item.adminOnly || portalUser?.role === 'admin'),
    [portalUser?.role]
  );

  // Build user info
  const userInfo: PortalUserInfo | null = useMemo(() => {
    if (!portalUser && !authUser) return null;
    return {
      name: portalUser?.name || authUser?.user_metadata?.full_name || '',
      school: portalUser?.school
        ? SCHOOL_LABELS[portalUser.school] || portalUser.school
        : '',
      role: portalUser?.role
        ? ROLE_LABELS[portalUser.role] || portalUser.role
        : '',
      program: (portalUser?.program as 'value' | 'quant') || null,
      isAdmin: portalUser?.role === 'admin',
    };
  }, [portalUser, authUser]);

  const handleLinkClick = (linkId: string) => {
    setActiveLink(linkId);
    setIsMobileMenuOpen(false);
  };

  // Logout route bypasses shell (isLogoutRoute defined above for bg logic)
  if (isLogoutRoute) {
    return <>{children}</>;
  }

  // During exit transitions, render a solid navy div instead of the white shell
  // so when NavyOverlay unmounts (tag → 'complete'), no white flash shows
  if (isExiting) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: NAVY.primary }}>
        <style>{`html, body { background-color: ${NAVY.primary}; }`}</style>
      </div>
    );
  }

  // Show skeleton while waiting for auth in dashboard mode
  const shouldShowSkeleton = mode !== 'login';
  if (shouldShowSkeleton && (!isClient || !authUser)) {
    return <PortalLoadingSkeleton showEntrance={showEntranceAnimation} />;
  }

  // Show logo during idle and greeting phases
  const showLogo = tag === 'idle' || tag === 'greeting';

  // Determine sidebar width
  const sidebarWidth = showLoginView
    ? LAYOUT.loginPanelWidth
    : isCollapsed
      ? LAYOUT.collapsedWidth
      : LAYOUT.sidebarWidth;

  // Only animate width during morph transition, not on initial load
  const isTransitioning = tag === 'morph' || tag === 'greeting';
  const morphDuration = isTransitioning ? 0.4 : 0.2;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Inline style to prevent flash of wrong color on first paint */}
      <style>{`html, body { background-color: ${useNavyBg ? NAVY.primary : '#ffffff'}; }`}</style>

      {/* Mobile nav (dashboard only) */}
      {showDashboardView && authUser && (
        <PortalMobileNav
          isMenuOpen={isMobileMenuOpen}
          onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
          activeLink={activeLink}
          onLinkClick={handleLinkClick}
          navItems={visibleNavItems}
          userInfo={userInfo}
        />
      )}

      {/* Navy panel — animates width from 50% (login) to 14rem (dashboard) */}
      <motion.aside
        className="hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden z-50 portal-sidebar"
        style={{
          backgroundColor: showDashboardView ? NAVY.alternate : NAVY.primary,
          boxShadow:
            'inset -1px 0 0 rgba(255,255,255,0.08), 4px 0 16px rgba(0,0,0,0.12)',
        }}
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: morphDuration, ease: easing }}
      >
        {showLoginView ? (
          <div className="flex flex-col h-full">
            <LoginPanelContent showLogo={showLogo} />
          </div>
        ) : (
          <motion.div
            key="sidebar-panel"
            className="flex flex-col h-full"
            initial={shouldAnimateSidebar ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: shouldAnimateSidebar ? 0.1 : 0,
            }}
          >
            <SidebarContent
              activeLink={activeLink}
              onLinkClick={handleLinkClick}
              isCollapsed={isCollapsed}
              onCollapseToggle={() => setIsCollapsed(prev => !prev)}
              navItems={visibleNavItems}
              userInfo={userInfo}
              shouldAnimate={shouldAnimateSidebar}
              onBackToWebsite={handleExit}
            />
          </motion.div>
        )}
      </motion.aside>

      {/* Content panel */}
      <div
        className={`flex-1 flex flex-col relative bg-white portal-content ${showLoginView ? 'min-h-screen max-h-dvh overflow-hidden lg:max-h-screen' : 'h-screen overflow-y-auto'}`}
      >
        {/* Mobile header for login view */}
        {showLoginView && (
          <div className="lg:hidden bg-navy px-6 py-4 pt-safe">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: easing }}
            >
              <Image
                src="/logos/pgiLogoTransparent.png"
                alt="PGI"
                width={100}
                height={20}
                className="h-6 w-auto"
              />
            </motion.div>
          </div>
        )}

        {/* Main content */}
        {showLoginView ? (
          <div className="flex-1 flex items-center justify-center px-6 py-6 lg:py-12 lg:px-16">
            <div className="w-full max-w-[340px]">{children}</div>
          </div>
        ) : (
          <div className="flex-1 min-w-0 text-gray-900">
            <MockModeIndicator />
            <div className="lg:p-8 p-4 pt-24 lg:pt-8 pb-safe">{children}</div>
          </div>
        )}

        {/* Login footer */}
        {showLoginView && (
          <motion.footer
            className="px-6 py-4 pb-safe text-center"
            animate={{ opacity: tag === 'idle' ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <a
                href={`${SITE_URL}/terms`}
                className="hover:text-gray-600 transition-colors"
              >
                Terms
              </a>
              <span className="text-gray-300">·</span>
              <a
                href={`${SITE_URL}/privacy`}
                className="hover:text-gray-600 transition-colors"
              >
                Privacy
              </a>
            </div>
          </motion.footer>
        )}
      </div>
    </div>
  );
}
