'use client';

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
  memo,
} from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
import { usePortalShell } from '@/contexts/PortalShellContext';
import { usePortalUser } from '@/hooks/usePortalUser';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SmoothTransition } from '@/components/ui/SmoothTransition';
import { NavyExpansionOverlay } from '@/components/ui/NavyExpansionOverlay';
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
import { EASING, NAVY_COLORS } from '@/lib/transitions';
import type { PortalUserInfo } from '@/components/portal/types';
import type { User as AuthUser } from '@supabase/supabase-js';

// Context for exit transition handler
const ExitTransitionContext = createContext<{
  onBackToWebsite: (e: React.MouseEvent) => void;
}>({
  onBackToWebsite: () => {},
});

/** Sidebar width in dashboard mode */
const SIDEBAR_WIDTH = '14rem';
/** Collapsed sidebar width */
const COLLAPSED_SIDEBAR_WIDTH = '4.5rem';

/** Icon mapping for nav items */
const NAV_ICONS: Record<string, React.ElementType> = {
  Home,
  Users,
  FolderOpen,
  PenSquare,
  BarChart3,
  Settings,
};
/** Login panel width (50% of screen) */
const LOGIN_PANEL_WIDTH = '50%';
/** Morph transition duration in seconds (optimized: 0.4s, down from 0.6s) */
const TRANSITION_DURATION = 0.4;
/** Easing curve for smooth animations */
const easing = EASING.smooth;

/** Memoized animation config to prevent recreation */
const navIndicatorTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
} as const;

/**
 * NavItem component for sidebar navigation
 * Memoized to prevent unnecessary re-renders during animation
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
  // Memoize transition to prevent object recreation
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4A6BB1] rounded-r"
                  transition={navIndicatorTransition}
                />
                <motion.span
                  layoutId="nav-bg"
                  className="absolute inset-0 bg-white/5 rounded-md -z-10"
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
 * Login panel content - centered logo only (Back to Website moved to right panel)
 */
function LoginPanelContent() {
  const { phase } = usePortalShell();
  const showLogo = phase === 'idle' || phase === 'success';

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
}: {
  activeLink: string;
  onLinkClick: (linkId: string) => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  navItems: typeof NAV_ITEMS;
  userInfo: PortalUserInfo | null;
  shouldAnimate: boolean;
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

      {/* Nav items - TooltipProvider wraps all items once (not per-item) for better performance */}
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

        {/* Settings — pinned to bottom, above user card */}
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
      <SidebarFooter isCollapsed={isCollapsed} shouldAnimate={shouldAnimate} />
    </>
  );
}

/**
 * Sidebar footer with Back to Website and Log Out - uses exit transition
 */
function SidebarFooter({
  isCollapsed,
  shouldAnimate,
}: {
  isCollapsed: boolean;
  shouldAnimate: boolean;
}) {
  const { onBackToWebsite } = useContext(ExitTransitionContext);

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
 * Program-based accent colors for user card (matching Directory colors)
 * Quant = blue, Value = purple
 */
const PROGRAM_COLORS = {
  quant: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    badgeBg: 'bg-blue-500',
  },
  value: {
    border: 'border-purple-500/40',
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
 * User card component with program badge in top right corner
 */
function UserCard({
  userInfo,
  shouldAnimate,
}: {
  userInfo: PortalUserInfo;
  shouldAnimate: boolean;
}) {
  const colors = PROGRAM_COLORS[userInfo.program || 'default'];
  // Don't show role if it's "Admin" and user is admin (avoid duplicate)
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
      {/* Program badge in top right - blends with border */}
      {userInfo.program && (
        <span
          className={`absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full text-white ${colors.badgeBg}`}
        >
          {userInfo.program === 'value' ? 'Value' : 'Quant'}
        </span>
      )}

      {/* Name row */}
      <div className="flex items-center gap-2">
        <span className="font-medium text-white text-sm">{userInfo.name}</span>
        {userInfo.isAdmin && (
          <span className="text-[10px] font-medium tracking-wide text-amber-400/80 uppercase">
            Admin
          </span>
        )}
      </div>

      {/* Info row - school and role (without duplicate admin) */}
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

/**
 * UnifiedPortalShell - Single component that morphs between login and dashboard views.
 *
 * Login view: 50% navy panel (centered logo) + white content area (login form)
 * Dashboard view: 14rem sidebar (nav + user) + white content area (dashboard)
 *
 * The transition animates:
 * 1. Navy panel width from 50% to 14rem
 * 2. Content crossfade between login logo and sidebar nav
 */
export function UnifiedPortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const { mode, phase, setMode } = usePortalShell();
  const isMobile = useIsMobile();

  // UI state
  const [activeLink, setActiveLink] = useState('home');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  // Use SWR-cached portal user (deduplicates API calls across components)
  const { user: portalUser } = usePortalUser(!!authUser);

  // Exit transition state (Back to Website)
  const [isExitTransitioning, setIsExitTransitioning] = useState(false);

  // Entrance animation flag (from Header portal button)
  // Computed once on mount - if ?entrance=true, show smooth content fade-in
  const [showEntranceAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).has('entrance');
    }
    return false;
  });

  // Handle "Back to Website" with smooth navy expand animation (matches logout)
  const handleBackToWebsite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsExitTransitioning(true);

      // Navy expands then navigate with full page reload
      // Mobile: 300ms (shorter animation), Desktop: 500ms
      // Use SITE_URL to escape portal subdomain (portal.* rewrites / to /portal/)
      setTimeout(
        () => {
          window.location.href = SITE_URL;
        },
        isMobile ? 300 : 500
      );
    },
    [isMobile]
  );

  // Determine route type - only need logout for bypass, login handled by server redirect
  const isLogoutRoute = pathname?.includes('/logout');

  // Determine view based on mode and phase
  // - Login view: during login mode OR transitioning (success/fadeOut phases)
  // - Dashboard view: only after morphing starts or in dashboard mode
  const isMorphing = phase === 'morphing' || phase === 'complete';
  const showLoginView =
    mode === 'login' || (mode === 'transitioning' && !isMorphing);
  const showDashboardView = isMorphing || mode === 'dashboard';

  // Should animate sidebar entrance (after morph transition)
  const [shouldAnimateSidebar, setShouldAnimateSidebar] = useState(false);

  useEffect(() => setIsClient(true), []);

  // Clear entrance param from URL (cosmetic cleanup, doesn't affect state)
  useEffect(() => {
    if (showEntranceAnimation && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('entrance')) {
        url.searchParams.delete('entrance');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [showEntranceAnimation]);

  // iOS safe-area background fix
  // Login: navy body (matches status bar + header for both mobile and desktop)
  // Dashboard: always white
  // Bottom overscroll solved by max-h-dvh, so navy is safe on mobile too
  useEffect(() => {
    const bgColor = showLoginView ? NAVY_COLORS.primary : '#ffffff';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, [showLoginView]);

  // Auth state management
  // Only sets authUser state - does NOT change mode
  // Mode is controlled by: initialMode (from server) + triggerTransition() + resetToLogin()
  // This separation prevents race conditions during the login animation
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthUser(user);
      // Only reset to login if user is null AND mode is dashboard (logout case)
      // Don't touch mode if we're in login or transitioning (animation playing)
      if (!user && mode === 'dashboard') {
        setMode('login');
      }
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setAuthUser(user);
      // Only reset to login on logout (user becomes null while in dashboard mode)
      if (!user && mode === 'dashboard') {
        setMode('login');
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, setMode, mode]);

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
    if (phase !== 'complete') return;

    setShouldAnimateSidebar(true);
    // Reset after animations complete
    const timer = setTimeout(() => setShouldAnimateSidebar(false), 1000);
    return () => clearTimeout(timer);
  }, [phase]);

  // Filter nav items by role
  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter(item => !item.adminOnly || portalUser?.role === 'admin'),
    [portalUser?.role]
  );

  // Build user info for components
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

  // Handlers
  const handleLinkClick = (linkId: string) => {
    setActiveLink(linkId);
    setIsMobileMenuOpen(false);
  };

  // Logout route bypasses the shell entirely - render children directly
  // This allows the logout page to show its own full-screen UI
  // IMPORTANT: This must be after all hooks to avoid React hooks violation
  if (isLogoutRoute) {
    return <>{children}</>;
  }

  // Loading states:
  // - Login mode: render immediately (the login shell IS the loading state)
  // - Dashboard mode: show skeleton while waiting for auth client-side
  //
  // Mode is now the single source of truth (server handles redirects)
  const shouldShowSkeleton = mode !== 'login' && mode !== 'transitioning';

  if (shouldShowSkeleton && (!isClient || !authUser)) {
    return <PortalLoadingSkeleton showEntrance={showEntranceAnimation} />;
  }

  // Context value for exit transition
  const exitContextValue = { onBackToWebsite: handleBackToWebsite };

  return (
    <ExitTransitionContext.Provider value={exitContextValue}>
      <div className="flex min-h-screen bg-white">
        {/* Set html/body background - matches useEffect logic, prevents flash of wrong color on first paint */}
        <style>{`html, body { background-color: ${showLoginView ? NAVY_COLORS.primary : '#ffffff'}; }`}</style>

        {/* Mobile nav (only for dashboard view) */}
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

        {/* Navy panel - animates width from 50% (login) to 14rem (dashboard) */}
        {/* Only animate during actual transitions, not on initial page load */}
        <motion.aside
          className="hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden z-50 portal-sidebar"
          style={{
            backgroundColor: showDashboardView
              ? NAVY_COLORS.alternate
              : NAVY_COLORS.primary,
            boxShadow:
              'inset -1px 0 0 rgba(255,255,255,0.08), 4px 0 16px rgba(0,0,0,0.12)',
          }}
          initial={false}
          animate={{
            width: showLoginView
              ? LOGIN_PANEL_WIDTH
              : isCollapsed
                ? COLLAPSED_SIDEBAR_WIDTH
                : SIDEBAR_WIDTH,
          }}
          transition={{
            duration: mode === 'transitioning' ? TRANSITION_DURATION : 0.2,
            ease: easing,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showLoginView ? (
              <motion.div
                key="login-panel"
                className="flex flex-col h-full"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LoginPanelContent />
              </motion.div>
            ) : (
              <motion.div
                key="sidebar-panel"
                className="flex flex-col h-full"
                initial={shouldAnimateSidebar ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        {/* Content panel - always white */}
        <div
          className={`flex-1 flex flex-col relative bg-white portal-content ${showLoginView ? 'min-h-screen max-h-dvh overflow-hidden lg:max-h-screen' : 'h-screen overflow-y-auto'}`}
        >
          {/* Mobile header for login view — logo only, slides in/out */}
          {showLoginView && (
            <div className="lg:hidden bg-navy px-6 py-4 pt-safe">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={
                  isExitTransitioning
                    ? { opacity: 0, x: -20 }
                    : { opacity: 1, x: 0 }
                }
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

          {/* Main content area */}
          {showLoginView ? (
            // Login content - centered
            <div className="flex-1 flex items-center justify-center px-6 py-6 lg:py-12 lg:px-16">
              <div className="w-full max-w-[340px]">{children}</div>
            </div>
          ) : (
            // Dashboard content - full width with padding
            <div className="flex-1 min-w-0 text-gray-900">
              <MockModeIndicator />
              <div className="lg:p-8 p-4 pt-24 lg:pt-8 pb-safe">{children}</div>
            </div>
          )}

          {/* Footer for login view */}
          {showLoginView && (
            <motion.footer
              className="px-6 py-4 pb-safe text-center"
              animate={{ opacity: phase === 'idle' ? 1 : 0 }}
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

      {/* Exit Transition Overlay (Back to Website) - Navy expands to fill screen (matches logout) */}
      <AnimatePresence>
        {isExitTransitioning && (
          <NavyExpansionOverlay
            initialWidth={showLoginView ? '50%' : SIDEBAR_WIDTH}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </ExitTransitionContext.Provider>
  );
}
