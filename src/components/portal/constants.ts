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
  icon: string;
  adminOnly: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    href: '/portal',
    label: 'Home',
    icon: 'Home',
    adminOnly: false,
  },
  {
    id: 'directory',
    href: '/portal/directory',
    label: 'Directory',
    icon: 'Users',
    adminOnly: false,
  },
  {
    id: 'resources',
    href: '/portal/resources',
    label: 'Resources',
    icon: 'FolderOpen',
    adminOnly: false,
  },
  {
    id: 'content',
    href: '/portal/content',
    label: 'Content',
    icon: 'PenSquare',
    adminOnly: true,
  },
  {
    id: 'observability',
    href: '/portal/observability',
    label: 'Analytics',
    icon: 'BarChart3',
    adminOnly: true,
  },
  {
    id: 'settings',
    href: '/portal/settings',
    label: 'Settings',
    icon: 'Settings',
    adminOnly: false,
  },
];

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://paragoninvestments.org';

export const SIDEBAR_VARIANTS = {
  expanded: { width: '14rem', backgroundColor: '#00172B' },
  collapsed: { width: '4.5rem', backgroundColor: '#00172B' },
};
