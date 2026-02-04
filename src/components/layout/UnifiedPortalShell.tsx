'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { usePortalShell } from '@/contexts/PortalShellContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SmoothTransition } from '@/components/ui/SmoothTransition';
import { PortalMobileNav } from '@/components/portal/PortalMobileNav';
import { PortalLoadingSkeleton } from '@/components/portal/PortalLoadingSkeleton';
import {
  NAV_ITEMS,
  SCHOOL_LABELS,
  ROLE_LABELS,
  SITE_URL,
} from '@/components/portal/constants';
import type { PortalUserInfo } from '@/components/portal/types';
import type { User } from '@/types';
import type { User as AuthUser } from '@supabase/supabase-js';

const SIDEBAR_WIDTH = '14rem';
const LOGIN_PANEL_WIDTH = '50%';
const TRANSITION_DURATION = 0.6;
const easing = [0.4, 0, 0.2, 1];

/**
 * NavItem component for sidebar navigation
 */
function NavItem({
  href,
  label,
  isActive,
  onClick,
  isCollapsed,
  index,
  shouldAnimate,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
  index: number;
  shouldAnimate: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} onClick={onClick} className="w-full block">
            <motion.div
              initial={shouldAnimate ? { opacity: 0, x: -10 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: shouldAnimate ? 0.3 + index * 0.05 : 0,
                ease: easing,
              }}
              className={`relative flex items-center rounded-md text-sm transition-colors duration-200 ${
                isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4A6BB1] rounded-r"
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
              {!isCollapsed && <span>{label}</span>}
              {isCollapsed && (
                <span className="text-xs font-medium">{label[0]}</span>
              )}
            </motion.div>
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Login panel content - centered logo and "Back to Website" link
 */
function LoginPanelContent() {
  const { phase } = usePortalShell();
  const showLogo = phase === 'idle' || phase === 'success';

  return (
    <>
      {/* Centered logo */}
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

      {/* Back to Website */}
      <motion.div
        className="relative z-10 px-4 py-4"
        animate={{ opacity: phase === 'idle' ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <a
          href={SITE_URL}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Back to Website
        </a>
      </motion.div>
    </>
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
            <div
              className="w-8 h-8 rounded cursor-pointer"
              onClick={onCollapseToggle}
            >
              <Image
                src="/logos/pgiLogoTransparent.png"
                alt="PGI"
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
              isActive={activeLink === item.id}
              onClick={() => onLinkClick(item.id)}
              isCollapsed={isCollapsed}
              index={index}
              shouldAnimate={shouldAnimate}
            />
          ))}
        </nav>
      </div>

      {/* User section */}
      {!isCollapsed && userInfo && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: shouldAnimate ? 0.5 : 0,
            ease: easing,
          }}
          className="px-4 py-3 mx-3 mb-3 bg-[#002C4D] rounded-md border border-[#003E6B]/50"
        >
          <div className="font-medium text-white text-sm">{userInfo.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {userInfo.school}
            {userInfo.school && userInfo.role ? ' / ' : ''}
            {userInfo.role}
          </div>
          {userInfo.isAdmin && (
            <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded">
              Admin
            </span>
          )}
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: shouldAnimate ? 0.6 : 0 }}
        className="px-3 py-3 border-t border-[#003E6B]/50 space-y-0.5"
      >
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={SITE_URL}
                  className="flex items-center justify-center text-gray-400 hover:text-gray-200 py-2 rounded-md text-xs"
                >
                  ←
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">Back to Website</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <a
              href={SITE_URL}
              className="block px-3 py-2 text-sm text-gray-400 hover:text-gray-200 rounded-md"
            >
              Back to Website
            </a>
            <Link
              href="/portal/logout"
              className="block px-3 py-2 text-sm text-gray-400 hover:text-red-400 rounded-md"
            >
              Log Out
            </Link>
          </>
        )}
      </motion.div>
    </>
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

  // UI state
  const [activeLink, setActiveLink] = useState('home');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [portalUser, setPortalUser] = useState<User | null>(null);

  // Determine route type - use pathname directly (works on server and client)
  const isLoginRoute = pathname?.includes('/login');
  const isLogoutRoute = pathname?.includes('/logout');

  // Determine view based on pathname, mode, and transition phase
  // During morphing/complete phases, show dashboard even if on login route (for animation)
  const isMorphing = phase === 'morphing' || phase === 'complete';
  const showLoginView = !isMorphing && (isLoginRoute || mode === 'login');
  const showDashboardView =
    isMorphing || (!isLoginRoute && mode === 'dashboard');

  // Should animate sidebar entrance (after morph transition)
  const [shouldAnimateSidebar, setShouldAnimateSidebar] = useState(false);

  useEffect(() => setIsClient(true), []);

  // iOS safe-area background fix
  useEffect(() => {
    const bgColor = showLoginView ? '#0a1628' : '#ffffff';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, [showLoginView]);

  // Auth state management
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthUser(user);
      // If user is authenticated and on login route, prepare for dashboard mode
      if (user && !isLoginRoute) {
        setMode('dashboard');
      }
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, [supabase, isLoginRoute, setMode]);

  // Fetch portal user when authenticated
  useEffect(() => {
    if (!authUser) return;
    fetch('/api/users/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setPortalUser(data.user))
      .catch(() => {});
  }, [authUser]);

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
  // - Login routes: render immediately (the login shell IS the loading state)
  // - Dashboard routes: show skeleton while waiting for auth
  //
  // Use pathname as primary signal since it's available during SSR
  // Mode is secondary (comes from context, may not be stable during hydration)
  const shouldShowSkeleton =
    !isLoginRoute && mode !== 'login' && mode !== 'transitioning';

  if (shouldShowSkeleton && (!isClient || !authUser)) {
    return <PortalLoadingSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Set html/body background - white for clean appearance */}
      <style>{`html, body { background-color: #ffffff; }`}</style>

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
        className="hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden z-50"
        style={{ backgroundColor: showDashboardView ? '#00172B' : '#0a1628' }}
        initial={false}
        animate={{
          width: showLoginView ? LOGIN_PANEL_WIDTH : SIDEBAR_WIDTH,
        }}
        transition={{
          duration: mode === 'transitioning' ? TRANSITION_DURATION : 0,
          ease: easing,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {showLoginView ? (
            <motion.div
              key="login-panel"
              className="flex flex-col h-full"
              initial={mode === 'transitioning' ? { opacity: 0 } : false}
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
      <div className="flex-1 flex flex-col min-h-screen relative bg-white">
        {/* Mobile header for login view */}
        {showLoginView && (
          <div className="lg:hidden bg-[#0a1628] px-6 py-4">
            <div className="flex items-center justify-between">
              <Image
                src="/logos/pgiLogoTransparent.png"
                alt="PGI"
                width={100}
                height={20}
                className="h-6 w-auto"
              />
              <a
                href={SITE_URL}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Back to Website
              </a>
            </div>
          </div>
        )}

        {/* Main content area */}
        {showLoginView ? (
          // Login content - centered
          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
            <div className="w-full max-w-[340px]">{children}</div>
          </div>
        ) : (
          // Dashboard content - full width with padding
          <div className="flex-1 min-w-0 text-gray-900">
            <div className="lg:p-8 p-4 pt-24 lg:pt-8 pb-safe">{children}</div>
          </div>
        )}

        {/* Footer for login view */}
        {showLoginView && (
          <motion.footer
            className="px-6 py-4 text-center"
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
  );
}
