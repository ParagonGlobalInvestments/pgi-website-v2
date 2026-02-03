'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { usePathname } from 'next/navigation';
import type { User } from '@/types';

import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { PortalMobileNav } from '@/components/portal/PortalMobileNav';
import { PortalLoadingSkeleton } from '@/components/portal/PortalLoadingSkeleton';
import { NAV_ITEMS, SCHOOL_LABELS, ROLE_LABELS } from '@/components/portal/constants';
import type { PortalUserInfo } from '@/components/portal/types';

export default function PortalMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const pathname = usePathname();

  const [activeLink, setActiveLink] = useState('home');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [portalUser, setPortalUser] = useState<User | null>(null);

  useEffect(() => setIsClient(true), []);

  // iOS safe-area background fix
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#ffffff';
    document.body.style.backgroundColor = '#ffffff';
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  // Auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch portal user
  useEffect(() => {
    if (!authUser) return;
    fetch('/api/users/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setPortalUser(data.user))
      .catch(() => {});
  }, [authUser]);

  // Sync active link with pathname
  useEffect(() => {
    if (pathname.includes('/directory')) setActiveLink('directory');
    else if (pathname.includes('/resources')) setActiveLink('resources');
    else if (pathname.includes('/content')) setActiveLink('content');
    else if (pathname.includes('/observability')) setActiveLink('observability');
    else if (pathname.includes('/settings')) setActiveLink('settings');
    else setActiveLink('home');
  }, [pathname]);

  // Mobile menu body overflow
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // Filter nav items by role
  const visibleNavItems = useMemo(() =>
    NAV_ITEMS.filter(item => !item.adminOnly || portalUser?.role === 'admin'),
    [portalUser?.role]
  );

  // Build user info for components
  const userInfo: PortalUserInfo | null = useMemo(() => {
    if (!portalUser && !authUser) return null;
    return {
      name: portalUser?.name || authUser?.user_metadata?.full_name || '',
      school: portalUser?.school ? (SCHOOL_LABELS[portalUser.school] || portalUser.school) : '',
      role: portalUser?.role ? (ROLE_LABELS[portalUser.role] || portalUser.role) : '',
      isAdmin: portalUser?.role === 'admin',
    };
  }, [portalUser, authUser]);

  // Handlers
  const handleLinkClick = (linkId: string) => {
    setActiveLink(linkId);
    setIsMobileMenuOpen(false);
  };

  if (!isClient || !authUser) {
    return <PortalLoadingSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-white relative">
      <PortalMobileNav
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
        activeLink={activeLink}
        onLinkClick={handleLinkClick}
        navItems={visibleNavItems}
        userInfo={userInfo}
      />

      <PortalSidebar
        activeLink={activeLink}
        onLinkClick={handleLinkClick}
        isCollapsed={isCollapsed}
        onCollapseToggle={() => setIsCollapsed(prev => !prev)}
        navItems={visibleNavItems}
        userInfo={userInfo}
      />

      <div className="flex-1 min-w-0 bg-white text-gray-900">
        <div className="lg:p-8 p-4 pt-24 lg:pt-8 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
