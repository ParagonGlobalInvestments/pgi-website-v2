/**
 * Navigation item configuration
 */
export interface PortalNavItem {
  id: string;
  href: string;
  label: string;
  icon: string;
  adminOnly: boolean;
}

/**
 * User display information for the sidebar
 */
export interface PortalUserInfo {
  name: string;
  school: string;
  role: string;
  program: 'value' | 'quant' | null;
  isAdmin: boolean;
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
