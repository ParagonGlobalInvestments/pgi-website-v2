'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import type { NavItem, AboutSubItem } from './types';

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

export interface MobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  expandedAbout: boolean;
  expandedNationalCommittee: boolean;
  expandedMembers: boolean;
  toggleSection: (section: string) => void;
  mainNav: NavItem[];
  aboutSubItems: AboutSubItem[];
  authButtons: React.ReactNode;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
        expanded ? 'rotate-180' : ''
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
  );
}

function MobileAccordion({
  label,
  expanded,
  onToggle,
  items,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  items: { name: string; url: string }[];
}) {
  return (
    <motion.div variants={mobileItemVariants}>
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between py-2 px-4 text-white font-medium rounded-lg hover:bg-navy-light/50 transition-all duration-200 active:scale-[0.98]"
      >
        <span>{label}</span>
        <ChevronIcon expanded={expanded} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
            className="ml-4 mt-1 space-y-1 overflow-hidden"
          >
            {items.map((item, index) => (
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
  );
}

/** Hamburger toggle button — rendered inside the header container div. */
export function MobileMenuButton({
  mobileMenuOpen,
  setMobileMenuOpen,
}: Pick<MobileMenuProps, 'mobileMenuOpen' | 'setMobileMenuOpen'>) {
  return (
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
  );
}

/** Expandable dropdown panel — rendered directly inside <header>, after the container div. */
export function MobileMenuDropdown({
  mobileMenuOpen,
  expandedAbout,
  expandedNationalCommittee,
  expandedMembers,
  toggleSection,
  mainNav,
  aboutSubItems,
  authButtons,
}: Omit<MobileMenuProps, 'setMobileMenuOpen'>) {
  return (
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
            <MobileAccordion
              label="About"
              expanded={expandedAbout}
              onToggle={() => toggleSection('about')}
              items={aboutSubItems}
            />

            {/* National Committee with dropdown */}
            <MobileAccordion
              label="Committee"
              expanded={expandedNationalCommittee}
              onToggle={() => toggleSection('nationalCommittee')}
              items={mainNav[2]?.subItems ?? []}
            />

            {/* Members with dropdown */}
            <MobileAccordion
              label="Members"
              expanded={expandedMembers}
              onToggle={() => toggleSection('members')}
              items={mainNav[3]?.subItems ?? []}
            />

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

            {/* Authentication links */}
            <motion.div variants={mobileItemVariants} className="pt-2">
              {authButtons}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
