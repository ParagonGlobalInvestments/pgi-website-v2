'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { PortalMobileNavProps } from './types';
import { SITE_URL } from './constants';

/**
 * Mobile navigation bar and overlay menu for the portal.
 * Shows a fixed top bar with hamburger menu that expands to full-screen overlay.
 */
export function PortalMobileNav({
  isMenuOpen,
  onMenuToggle,
  activeLink,
  onLinkClick,
  navItems,
  userInfo,
}: PortalMobileNavProps) {
  return (
    <>
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
            onClick={onMenuToggle}
            className="text-white p-2 hover:bg-[#003E6B] rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {isMenuOpen ? (
              <svg
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
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 bg-[#00172B]/95 backdrop-blur-sm z-[55] pt-16"
          >
            <div className="p-4">
              {/* User info */}
              {userInfo && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-[#002C4D] rounded-lg">
                  <div className="flex-1">
                    <div className="text-white font-medium">{userInfo.name}</div>
                    <div className="text-xs text-gray-400">
                      {userInfo.school}
                      {userInfo.school && userInfo.role ? ' / ' : ''}
                      {userInfo.role}
                    </div>
                  </div>
                </div>
              )}

              <motion.nav
                className="space-y-1 text-sm"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
                initial="hidden"
                animate="visible"
              >
                {navItems.map(item => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { type: 'spring', stiffness: 400, damping: 25 },
                      },
                    }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-3 rounded-md text-white min-h-[44px] ${
                        activeLink === item.id
                          ? 'bg-[#003E6B] font-medium'
                          : 'hover:bg-[#002C4D]'
                      }`}
                      onClick={() => onLinkClick(item.id)}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div
                className="mt-6 pt-4 border-t border-[#003E6B] space-y-1"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { delay: 0.2 } },
                }}
                initial="hidden"
                animate="visible"
              >
                <a
                  href={SITE_URL}
                  className="flex items-center text-sm px-3 py-3 rounded-md text-gray-400 hover:bg-[#002C4D] min-h-[44px]"
                  onClick={onMenuToggle}
                >
                  Back to Website
                </a>
                <Link
                  href="/portal/logout"
                  className="flex items-center text-sm px-3 py-3 rounded-md text-red-400 hover:bg-[#002C4D] min-h-[44px]"
                  onClick={onMenuToggle}
                >
                  Log Out
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
