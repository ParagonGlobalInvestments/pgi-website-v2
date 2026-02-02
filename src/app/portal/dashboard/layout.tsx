'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaCog,
  FaHome,
  FaChevronLeft,
  FaBook,
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SmoothTransition } from '@/components/ui/SmoothTransition';
import type { User } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const SCHOOL_LABELS: Record<string, string> = {
  brown: 'Brown',
  columbia: 'Columbia',
  cornell: 'Cornell',
  nyu: 'NYU',
  princeton: 'Princeton',
  uchicago: 'UChicago',
  upenn: 'UPenn',
  yale: 'Yale',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  committee: 'Committee',
  pm: 'PM',
  analyst: 'Analyst',
};

const NAV_ITEMS = [
  { id: 'dashboard', href: '/portal/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { id: 'directory', href: '/portal/dashboard/directory', icon: FaUsers, label: 'Directory' },
  { id: 'resources', href: '/portal/dashboard/resources', icon: FaBook, label: 'Resources' },
  { id: 'settings', href: '/portal/dashboard/settings', icon: FaCog, label: 'Settings' },
];

const SIDEBAR_VARIANTS = {
  expanded: { width: '16rem', backgroundColor: '#00172B' },
  collapsed: { width: '4.5rem', backgroundColor: '#00172B' },
};

// ============================================================================
// NavItem
// ============================================================================

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
  isCollapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} onClick={onClick} className="w-full">
            <Button
              variant={isActive ? 'navy-accent' : 'ghost'}
              className={`w-full ${
                isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
              } transition-all duration-200 text-gray-300 hover:text-white`}
            >
              <span className={`text-sm ${isCollapsed ? 'mx-0' : 'mr-3'}`}>
                <Icon className="h-4 w-4" />
              </span>
              {!isCollapsed && <span className="text-sm">{label}</span>}
            </Button>
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// Main Layout
// ============================================================================

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const [activeLink, setActiveLink] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [portalUser, setPortalUser] = useState<User | null>(null);

  useEffect(() => setIsClient(true), []);

  // Check auth
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

  // Fetch portal user data
  useEffect(() => {
    if (!authUser) return;
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          setPortalUser(data.user);
        }
      } catch {
        // silently fail
      }
    };
    fetchUser();
  }, [authUser]);

  // Set active link from URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/directory')) setActiveLink('directory');
    else if (path.includes('/resources')) setActiveLink('resources');
    else if (path.includes('/settings')) setActiveLink('settings');
    else setActiveLink('dashboard');
  }, []);

  // Mobile menu body overflow
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const displayName = portalUser?.name || authUser?.user_metadata?.full_name || '';
  const displaySchool = portalUser?.school ? (SCHOOL_LABELS[portalUser.school] || portalUser.school) : '';
  const displayRole = portalUser?.role ? (ROLE_LABELS[portalUser.role] || portalUser.role) : '';

  // Loading
  if (!isClient || !authUser) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Mobile Nav Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-[#00172B] border-b border-[#003E6B] shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Image
            src="/logos/pgiLogoTransparent.png"
            alt="PGI"
            width={120}
            height={24}
            className="h-8 w-auto"
          />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:bg-[#003E6B] rounded-md"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#00172B] transition-transform duration-300 ease-in-out z-[55] ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        } pt-16`}
      >
        <div className="p-4">
          {/* User info */}
          <div className="flex items-center space-x-3 mb-4 p-3 bg-[#002C4D] rounded-lg">
            <div className="flex-1">
              <div className="text-white font-medium">{displayName}</div>
              <div className="text-xs text-gray-400">
                {displaySchool}{displaySchool && displayRole ? ' / ' : ''}{displayRole}
              </div>
            </div>
          </div>

          <nav className="space-y-1 text-sm">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-white ${
                  activeLink === item.id ? 'bg-[#003E6B]' : 'hover:bg-[#002C4D]'
                }`}
                onClick={() => {
                  setActiveLink(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-6 space-y-1">
            <Link
              href="/"
              className="flex items-center text-sm space-x-3 px-3 py-3 rounded-md text-gray-400 hover:bg-[#002C4D]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHome className="h-5 w-5" />
              <span>Back to Website</span>
            </Link>
            <Link
              href="/portal/signout"
              className="flex items-center text-sm space-x-3 px-3 py-3 rounded-md text-red-400 hover:bg-[#002C4D]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="h-5 w-5 flex items-center justify-center text-xs">&#x2192;</span>
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-shrink-0 flex-col h-screen sticky top-0 overflow-hidden z-50"
        variants={SIDEBAR_VARIANTS}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Logo + collapse */}
        <div className="px-4 py-4 flex items-center justify-between">
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

          <div className="flex items-center rounded-full">
            <SmoothTransition isVisible={isCollapsed} direction="scale" className="w-full">
              <div
                className="w-8 h-8 rounded cursor-pointer"
                onClick={() => setIsCollapsed(false)}
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
                      onClick={() => setIsCollapsed(true)}
                      variant="ghost"
                      size="icon"
                      className="text-white h-8 w-8 hover:text-white"
                    >
                      <FaChevronLeft size={14} />
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
            <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Main
            </h2>
          )}
          <nav className="space-y-1">
            {NAV_ITEMS.map(item => (
              <NavItem
                key={item.id}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={activeLink === item.id}
                onClick={() => setActiveLink(item.id)}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>
        </div>

        {/* User section */}
        {!isCollapsed && portalUser && (
          <div className="px-4 py-3 mx-3 mb-3 bg-[#002C4D] rounded-md border border-[#003E6B]/50">
            <div className="font-medium text-white text-sm">{displayName}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {displaySchool}{displaySchool && displayRole ? ' / ' : ''}{displayRole}
            </div>
            {portalUser.role === 'admin' && (
              <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded">
                Admin
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-3 py-3 border-t border-[#003E6B] space-y-1">
          {isCollapsed ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/" className="w-full flex justify-center">
                      <Button
                        variant="ghost"
                        className="text-gray-300 hover:text-white hover:bg-[#003E6B] w-9 h-9 p-0 rounded-full"
                      >
                        <FaHome />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Back to Website</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <>
              <Link href="/" className="w-full block">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-[#003E6B] w-full justify-start px-3"
                >
                  <FaHome className="mr-2" />
                  <span>Back to Website</span>
                </Button>
              </Link>
              <Link href="/portal/signout" className="w-full block">
                <Button
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-[#003E6B] w-full justify-start px-3"
                >
                  <span className="mr-2">&#x2192;</span>
                  <span>Sign Out</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-white">
        <div className="lg:p-8 p-4 pt-20 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
