/**
 * Navigation item configuration
 */
export interface PortalNavItem {
  id: string;
  href: string;
  label: string;
  adminOnly: boolean;
}

/**
 * User display information for the sidebar
 */
export interface PortalUserInfo {
  name: string;
  school: string;
  role: string;
  isAdmin: boolean;
}

/**
 * Portal sidebar props
 */
export interface PortalSidebarProps {
  activeLink: string;
  onLinkClick: (linkId: string) => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  navItems: PortalNavItem[];
  userInfo: PortalUserInfo | null;
}

/**
 * Mobile nav bar props
 */
export interface PortalMobileNavProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  activeLink: string;
  onLinkClick: (linkId: string) => void;
  navItems: PortalNavItem[];
  userInfo: PortalUserInfo | null;
}
