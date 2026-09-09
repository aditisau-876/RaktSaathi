export interface NavItem {
  name: string;
  path: string;
  icon: string;
  badge?: string;
  badgeType?: 'alert' | 'count' | 'neutral';
}

export interface NavChapter {
  title: string;
  items: NavItem[];
}

export const NAVIGATION_CHAPTERS: NavChapter[] = [
  {
    title: 'Chapter 1 • Discovery',
    items: [
      { name: 'Overview', path: '/overview', icon: 'grid_view' },
      { name: 'Blood Shortage Radar', path: '/radar', icon: 'radar', badge: 'ALERT', badgeType: 'alert' },
    ],
  },
  {
    title: 'Chapter 2 • Decision',
    items: [
      { name: 'Shortage Decision Center', path: '/decision-center', icon: 'emergency', badge: 'ACTIVE', badgeType: 'alert' },
    ],
  },
  {
    title: 'Chapter 3 • Action Response',
    items: [
      { name: 'Campaign Studio', path: '/campaign-studio', icon: 'campaign', badge: 'AUTO', badgeType: 'neutral' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Blood Banks', path: '/blood-banks', icon: 'local_hospital' },
      { name: 'Hospital Requests', path: '/requests', icon: 'swap_horiz', badge: '8', badgeType: 'count' },
      { name: 'Donor Network', path: '/donor-network', icon: 'group', badge: '84 Ready', badgeType: 'neutral' },
    ],
  },
  {
    title: 'Data & System',
    items: [
      { name: 'Data Ingestion (OCR)', path: '/data-ingestion', icon: 'document_scanner', badge: 'SYNC', badgeType: 'neutral' },
      { name: 'System Settings', path: '/settings', icon: 'tune' },
    ],
  },
];
