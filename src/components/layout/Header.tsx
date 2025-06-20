'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import { trackEvent } from '@/lib/posthog';

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
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const staggerNavItems = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
};

const navItemAnimation = {
  hidden: {
    opacity: 0,
    y: -15,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
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
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
    },
  },
};

const dropdownAnimation = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.4,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
};

const mobileItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
};

const Header = () => {
  // State to manage dropdown visibility for mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // States to manage expanded sections in mobile
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [expandedNationalCommittee, setExpandedNationalCommittee] =
    useState(false);
  const [expandedMembers, setExpandedMembers] = useState(false);

  // Get current pathname for navigation events
  const pathname = usePathname();

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedAbout(false);
    setExpandedNationalCommittee(false);
    setExpandedMembers(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const header = document.querySelector('header');
      if (header && !header.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Function to handle About link direct click
  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // If we're on the home page, scroll to the About section
    if (window.location.pathname === '/') {
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      window.location.href = '/#about-section';
    }

    // Close mobile menu
    setMobileMenuOpen(false);
  };

  // Toggle section expansion for mobile
  const toggleSection = (section: string) => {
    if (section === 'about') {
      setExpandedAbout(!expandedAbout);
    } else if (section === 'nationalCommittee') {
      setExpandedNationalCommittee(!expandedNationalCommittee);
    } else if (section === 'members') {
      setExpandedMembers(!expandedMembers);
    }
  };

  const mainNav = [
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
  ];

  // Define About submenu items for consistency
  const aboutSubItems = [
    { name: 'Who We Are', url: '/who-we-are' },
    { name: 'Investment Strategy', url: '/investment-strategy' },
    { name: 'Education', url: '/education' },
    { name: 'Sponsors & Partners', url: '/sponsors' },
  ];

  return (
    <motion.header
      className="bg-pgi-dark-blue font-semibold z-50 relative"
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
              className="h-9 w-auto rounded-lg"
            />
            {/* <span className="ml-2 text-white text-sm md:text-xl font-light hidden xl:block">
              <DecryptedText
                text="Paragon Global Investments"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={50}
                useOriginalCharsOnly={true}
                className="text-sm md:text-xl font-normal text-white"
              />
            </span> */}
          </Link>
        </motion.div>

        <motion.nav
          className="hidden md:flex items-center space-x-4 lg:space-x-8 font-semibold"
          variants={staggerNavItems}
        >
          {/* About dropdown container */}
          <motion.div
            className="relative group"
            variants={navItemAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <a
              href="#"
              onClick={handleAboutClick}
              className="text-white hover:text-secondary transition-colors duration-300"
            >
              About
            </a>

            {/* Dropdown menu */}
            <div className="absolute z-50 left-0 mt-2 w-48 opacity-0 invisible transform -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
              {/* Dropdown content */}
              <motion.div
                className="bg-navy-light/90 backdrop-blur-lg border border-gray-700/50 rounded-md shadow-2xl overflow-hidden"
                variants={dropdownAnimation}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {aboutSubItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.url}
                      className="block px-4 py-3 text-white hover:bg-gray-700/50 transition-all duration-200 hover:translate-x-1"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* National Committee dropdown container */}
          <motion.div
            className="relative group"
            variants={navItemAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href="/national-committee"
              className="text-white whitespace-nowrap hover:text-secondary transition-colors duration-300"
            >
              Committee
            </Link>

            {/* Dropdown menu */}
            <div className="absolute z-50 left-0 mt-2 w-48 opacity-0 invisible transform -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
              {/* Dropdown content */}
              <motion.div
                className="bg-navy-light/90 backdrop-blur-lg border border-gray-700/50 rounded-md shadow-2xl overflow-hidden"
                variants={dropdownAnimation}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {mainNav[2]?.subItems?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.url}
                      className="block px-4 py-3 text-white hover:bg-gray-700/50 transition-all duration-200 hover:translate-x-1"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Members dropdown container */}
          <motion.div
            className="relative group"
            variants={navItemAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href="/members"
              className="text-white hover:text-secondary transition-colors duration-300"
            >
              Members
            </Link>

            {/* Dropdown menu */}
            <div className="absolute z-50 left-0 mt-2 w-48 opacity-0 invisible transform -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
              {/* Dropdown content */}
              <motion.div
                className="bg-navy-light/90 backdrop-blur-lg border border-gray-700/50 rounded-md shadow-2xl overflow-hidden"
                variants={dropdownAnimation}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {mainNav[3]?.subItems?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.url}
                      className="block px-4 py-3 text-white hover:bg-gray-700/50 transition-all duration-200 hover:translate-x-1"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            variants={navItemAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href="/placements"
              className="text-white hover:text-secondary transition-colors duration-300"
              onClick={() =>
                trackEvent('nav_click', {
                  section: 'header',
                  link: 'placements',
                  interest_type: 'career_opportunities',
                })
              }
            >
              Placements
            </Link>
          </motion.div>

          <motion.div
            variants={navItemAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href="/apply"
              className="text-white hover:text-secondary transition-colors duration-300"
              onClick={() =>
                trackEvent('nav_click', {
                  section: 'header',
                  link: 'apply',
                  interest_type: 'recruitment',
                  conversion_intent: 'high',
                })
              }
            >
              Apply
            </Link>
          </motion.div>

          <motion.div
            variants={navItemAnimation}
            whileHover="hover"
            whileTap="tap"
          >
            <Link
              href="/contact"
              className="text-white hover:text-secondary transition-colors duration-300"
              onClick={() =>
                trackEvent('nav_click', {
                  section: 'header',
                  link: 'contact',
                  interest_type: 'inquiry',
                  conversion_intent: 'medium',
                })
              }
            >
              Contact
            </Link>
          </motion.div>

          {/* Only show Portal in development */}
          {process.env.NODE_ENV !== 'production' && (
            <motion.div
              variants={navItemAnimation}
              whileHover="hover"
              whileTap="tap"
            >
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="bg-white text-black py-2 px-4 rounded hover:bg-opacity-90 transition-colors  font-bold"
                >
                  Dashboard
                </Link>
                {/* <UserButton /> */}
              </SignedIn>
              <SignedOut>
                <Link
                  href="/portal"
                  className=" py-2 px-4 rounded hover:bg-opacity-90 transition-colors font-bold bg-white text-black"
                >
                  Portal
                </Link>
              </SignedOut>
            </motion.div>
          )}
        </motion.nav>

        {/* Mobile Menu Button */}
        <motion.div className="md:hidden" variants={navItemAnimation}>
          <button
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="focus:outline-none text-white p-2 rounded-lg hover:bg-navy-light transition-all duration-200 active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </motion.div>
      </div>

      {/* Mobile dropdown menu - Enhanced with better animations */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-navy/95 backdrop-blur-sm shadow-2xl"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="px-4 py-2 space-y-1">
              {/* Home link */}
              <motion.div variants={mobileItemVariants}>
                <Link
                  href="/"
                  className="block py-2 px-4 text-white font-medium rounded-lg hover:bg-navy-light/50 transition-all duration-200 active:scale-[0.98]"
                >
                  Home
                </Link>
              </motion.div>

              {/* About section with dropdown */}
              <motion.div variants={mobileItemVariants}>
                <button
                  onClick={() => toggleSection('about')}
                  className="w-full text-left flex items-center justify-between py-2 px-4 text-white font-medium rounded-lg hover:bg-navy-light/50 transition-all duration-200 active:scale-[0.98]"
                >
                  <span>About</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                      expandedAbout ? 'rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {expandedAbout && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                      className="ml-4 mt-1 space-y-1 overflow-hidden"
                    >
                      {aboutSubItems.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={item.url}
                            className="block py-2 px-4 text-gray-300 text-sm font-normal rounded-md hover:bg-navy-light/30 hover:text-white transition-all duration-200"
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* National Committee with dropdown */}
              <motion.div variants={mobileItemVariants}>
                <button
                  onClick={() => toggleSection('nationalCommittee')}
                  className="w-full text-left flex items-center justify-between py-2 px-4 text-white font-medium rounded-lg hover:bg-navy-light/50 transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Committee</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                      expandedNationalCommittee ? 'rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {expandedNationalCommittee && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                      className="ml-4 mt-1 space-y-1 overflow-hidden"
                    >
                      {mainNav[2]?.subItems?.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={item.url}
                            className="block py-2 px-4 text-gray-300 text-sm font-normal rounded-md hover:bg-navy-light/30 hover:text-white transition-all duration-200"
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Members with dropdown */}
              <motion.div variants={mobileItemVariants}>
                <button
                  onClick={() => toggleSection('members')}
                  className="w-full text-left flex items-center justify-between py-2 px-4 text-white font-medium rounded-lg hover:bg-navy-light/50 transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Members</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                      expandedMembers ? 'rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {expandedMembers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                      className="ml-4 mt-1 space-y-1 overflow-hidden"
                    >
                      {mainNav[3]?.subItems?.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={item.url}
                            className="block py-2 px-4 text-gray-300 text-sm font-normal rounded-md hover:bg-navy-light/30 hover:text-white transition-all duration-200"
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Regular links */}
              {mainNav.slice(4).map((item, index) => (
                <motion.div
                  key={index}
                  variants={mobileItemVariants}
                  transition={{ delay: (index + 4) * 0.05 }}
                >
                  <Link
                    href={item.url}
                    className="block py-2 px-4 text-white font-medium rounded-lg hover:bg-navy-light/50 transition-all duration-200 active:scale-[0.98]"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}

              {/* Authentication links - Only show Portal in development */}
              {process.env.NODE_ENV !== 'production' && (
                <motion.div variants={mobileItemVariants} className="pt-2">
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="block py-3 px-4 mb-3 bg-primary text-white font-semibold rounded-lg text-center hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
                    >
                      Dashboard
                    </Link>
                    {/* <div className="flex justify-center">
                      <UserButton />
                    </div> */}
                  </SignedIn>
                  <SignedOut>
                    <Link
                      href="/portal"
                      className="block py-3 px-4 bg-white text-navy font-semibold rounded-lg text-center hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]"
                    >
                      Portal
                    </Link>
                  </SignedOut>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
