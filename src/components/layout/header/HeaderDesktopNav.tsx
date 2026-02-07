'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { trackEvent } from '@/lib/posthog';
import type { NavItem, AboutSubItem } from './types';

// Animation variants
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

interface HeaderDesktopNavProps {
  mainNav: NavItem[];
  aboutSubItems: AboutSubItem[];
  handleAboutClick: (e: React.MouseEvent) => void;
  authButtons: React.ReactNode;
}

export default function HeaderDesktopNav({
  mainNav,
  aboutSubItems,
  handleAboutClick,
  authButtons,
}: HeaderDesktopNavProps) {
  return (
    <motion.nav
      className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-8 font-normal text-xs lg:text-base"
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

      <motion.div variants={navItemAnimation} whileHover="hover" whileTap="tap">
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

      <motion.div variants={navItemAnimation} whileHover="hover" whileTap="tap">
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

      <motion.div variants={navItemAnimation} whileHover="hover" whileTap="tap">
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

      <motion.div variants={navItemAnimation} whileHover="hover" whileTap="tap">
        <Link
          href="/resources"
          className="text-white hover:text-secondary transition-colors duration-300"
        >
          Resources
        </Link>
      </motion.div>

      {/* Authentication Links */}
      <motion.div
        variants={navItemAnimation}
        whileHover="hover"
        whileTap="tap"
        className=""
      >
        {authButtons}
      </motion.div>
    </motion.nav>
  );
}
