'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/browser';
import { usePortalUser } from '@/hooks/usePortalUser';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePortalTransition } from '@/lib/portal-transitions';
import HeaderDesktopNav from './HeaderDesktopNav';
import { MobileMenuButton, MobileMenuDropdown } from './HeaderMobileMenu';
import HeaderAuthButtons from './HeaderAuthButtons';
import type { NavItem, AboutSubItem } from './types';

// Animation variants
const navbarAnimation = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const logoAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    x: -20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
    },
  },
};

const mainNav: NavItem[] = [
  { name: 'Home', url: '/' },
  { name: 'Who We Are', url: '/who-we-are' },
  {
    name: 'Committee',
    url: '/national-committee',
    subItems: [
      { name: 'Officers', url: '/national-committee/officers' },
      { name: 'Founders', url: '/national-committee/founders' },
    ],
  },
  {
    name: 'Members',
    url: '/members',
    subItems: [
      { name: 'Value Team', url: '/members/value-team' },
      { name: 'Quant Team', url: '/members/quant-team' },
    ],
  },
  { name: 'Placements', url: '/placements' },
  { name: 'Apply', url: '/apply' },
  { name: 'Contact', url: '/contact' },
  { name: 'Resources', url: '/resources' },
];

const aboutSubItems: AboutSubItem[] = [
  { name: 'Who We Are', url: '/who-we-are' },
  { name: 'Investment Strategy', url: '/investment-strategy' },
  { name: 'Education', url: '/education' },
  { name: 'Sponsors & Partners', url: '/sponsors' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [expandedNationalCommittee, setExpandedNationalCommittee] =
    useState(false);
  const [expandedMembers, setExpandedMembers] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { isMember: isPGIMember, isLoading: memberLoading } =
    usePortalUser(!!user);
  const loading = authLoading || (!!user && memberLoading);

  // Use the unified transition system — no local transition state needed
  const { start } = usePortalTransition();
  const isMobile = useIsMobile();

  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const prefetchPortalLogin = useCallback(() => {
    router.prefetch('/portal/login');
  }, [router]);

  const prefetchPortal = useCallback(() => {
    router.prefetch('/portal');
  }, [router]);

  // Handle login click — delegates to transition context (NavyOverlay handles visual)
  const handleLoginClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const mobile = isMobile; // snapshot at click time
      setMobileMenuOpen(false);
      start('entrance:login', { mobile });
    },
    [isMobile, start]
  );

  // Handle portal click (authenticated users)
  const handlePortalClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const mobile = isMobile; // snapshot at click time
      setMobileMenuOpen(false);
      start('entrance:portal', { mobile });
    },
    [isMobile, start]
  );

  // Auth state
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedAbout(false);
    setExpandedNationalCommittee(false);
    setExpandedMembers(false);
  }, [pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const header = document.querySelector('header');
      if (header && !header.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#about-section';
    }
    setMobileMenuOpen(false);
  };

  const toggleSection = (section: string) => {
    if (section === 'about') {
      setExpandedAbout(!expandedAbout);
    } else if (section === 'nationalCommittee') {
      setExpandedNationalCommittee(!expandedNationalCommittee);
    } else if (section === 'members') {
      setExpandedMembers(!expandedMembers);
    }
  };

  const authProps = {
    loading,
    user,
    isPGIMember,
    handleLoginClick,
    handlePortalClick,
    prefetchPortalLogin,
    prefetchPortal,
  } as const;

  return (
    <motion.header
      className="bg-navy font-semibold z-50 relative"
      initial="hidden"
      animate="visible"
      variants={navbarAnimation}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <motion.div
          variants={logoAnimation}
          className="flex items-center"
          whileHover="hover"
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/logos/pgiLogoTransparent.png"
              alt="Paragon Global Investments"
              width={200}
              height={36}
              priority
              sizes="200px"
              className="h-9 w-auto rounded-lg"
            />
          </Link>
        </motion.div>

        <HeaderDesktopNav
          mainNav={mainNav}
          aboutSubItems={aboutSubItems}
          handleAboutClick={handleAboutClick}
          authButtons={<HeaderAuthButtons variant="desktop" {...authProps} />}
        />

        <MobileMenuButton
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      <MobileMenuDropdown
        mobileMenuOpen={mobileMenuOpen}
        expandedAbout={expandedAbout}
        expandedNationalCommittee={expandedNationalCommittee}
        expandedMembers={expandedMembers}
        toggleSection={toggleSection}
        mainNav={mainNav}
        aboutSubItems={aboutSubItems}
        authButtons={<HeaderAuthButtons variant="mobile" {...authProps} />}
      />
    </motion.header>
  );
};

export default Header;
