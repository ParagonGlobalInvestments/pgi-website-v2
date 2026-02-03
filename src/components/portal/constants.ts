/**
 * Portal sidebar constants
 */

export const SCHOOL_LABELS: Record<string, string> = {
  brown: 'Brown',
  columbia: 'Columbia',
  cornell: 'Cornell',
  nyu: 'NYU',
  princeton: 'Princeton',
  uchicago: 'UChicago',
  upenn: 'UPenn',
  yale: 'Yale',
};

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  committee: 'Committee',
  pm: 'PM',
  analyst: 'Analyst',
};

export interface NavItem {
  id: string;
  href: string;
  label: string;
  adminOnly: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '/portal', label: 'Home', adminOnly: false },
  { id: 'directory', href: '/portal/directory', label: 'Directory', adminOnly: false },
  { id: 'resources', href: '/portal/resources', label: 'Resources', adminOnly: false },
  { id: 'content', href: '/portal/content', label: 'Content', adminOnly: true },
  { id: 'observability', href: '/portal/observability', label: 'Analytics', adminOnly: true },
  { id: 'settings', href: '/portal/settings', label: 'Settings', adminOnly: false },
];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paragoninvestments.org';

export const SIDEBAR_VARIANTS = {
  expanded: { width: '14rem', backgroundColor: '#00172B' },
  collapsed: { width: '4.5rem', backgroundColor: '#00172B' },
};
