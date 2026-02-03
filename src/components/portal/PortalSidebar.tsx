'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SmoothTransition } from '@/components/ui/SmoothTransition';
import type { PortalSidebarProps } from './types';
import { SITE_URL, SIDEBAR_VARIANTS } from './constants';

/**
 * NavItem — text-only navigation link with active state via left accent bar
 */
function NavItem({
  href,
  label,
  isActive,
  onClick,
  isCollapsed,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} onClick={onClick} className="w-full block">
            <div
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
            </div>
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Desktop collapsible sidebar for the portal.
 * Features animated expand/collapse, user info section, and navigation.
 */
export function PortalSidebar({
  activeLink,
  onLinkClick,
  isCollapsed,
  onCollapseToggle,
  navItems,
  userInfo,
}: PortalSidebarProps) {
  return (
    <motion.aside
      className="hidden lg:flex flex-shrink-0 flex-col h-screen sticky top-0 overflow-hidden z-50"
      variants={SIDEBAR_VARIANTS}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
          <h2 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Main
          </h2>
        )}
        <nav className="space-y-0.5">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              href={item.href}
              label={item.label}
              isActive={activeLink === item.id}
              onClick={() => onLinkClick(item.id)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>

      {/* User section */}
      {!isCollapsed && userInfo && (
        <div className="px-4 py-3 mx-3 mb-3 bg-[#002C4D] rounded-md border border-[#003E6B]/50">
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
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#003E6B]/50 space-y-0.5">
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
      </div>
    </motion.aside>
  );
}
