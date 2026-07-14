export interface ICurrentPageNavItem {
  label: string;
  to: string;
}

interface IRegisteredNavItem {
  to: string;
  end?: boolean;
}

const userNavItems: IRegisteredNavItem[] = [
  { to: '/dashboard', end: true },
  { to: '/trackers' },
  { to: '/mock-tests' },
  { to: '/learning-agent' },
  { to: '/community' },
  { to: '/leaderboard' },
  { to: '/activity' },
];

const adminNavItems: IRegisteredNavItem[] = [
  { to: '/admin', end: true },
  { to: '/admin/users' },
  { to: '/admin/trackers' },
  { to: '/admin/mock-tests' },
  { to: '/admin/activity' },
  { to: '/admin/broadcast' },
  { to: '/admin/subscriptions' },
  { to: '/admin/audit-logs' },
  { to: '/admin/system-health' },
  { to: '/admin/ai-token-spend' },
  { to: '/admin/support-tickets' },
  { to: '/admin/support' },
];

const routeLabels: Array<[RegExp, string]> = [
  [/^\/admin\/users\/[^/]+/, 'User details'],
  [/^\/admin\/trackers\/reviews/, 'Tracker reviews'],
  [/^\/admin\/trackers\/published/, 'Published trackers'],
  [/^\/admin\/trackers\/[^/]+/, 'Tracker details'],
  [/^\/admin\/mock-tests\/[^/]+/, 'Mock test details'],
  [/^\/notifications/, 'Notifications'],
  [/^\/profile(?:\/|$)/, 'Profile'],
  [/^\/verify-and-earn/, 'Verify and earn'],
  [/^\/pricing/, 'Plans'],
  [/^\/support/, 'Support'],
  [/^\/friends\/search/, 'Find people'],
  [/^\/friends/, 'Friends'],
  [/^\/trackers\/published/, 'Published trackers'],
  [/^\/trackers\/[^/]+\/manage/, 'Manage tracker'],
  [/^\/trackers\/[^/]+\/roadmap/, 'Tracker roadmap'],
  [/^\/community\/verify/, 'Verify submission'],
  [/^\/community\/trackers/, 'Community tracker'],
  [/^\/leaderboard\/rewards/, 'Rewards'],
  [/^\/mock-tests\/generating/, 'Generating mock test'],
  [/^\/mock-tests\/attempts\/.+\/result/, 'Test result'],
  [/^\/mock-tests\/attempts\/.+\/analysis/, 'Test analysis'],
  [/^\/mock-tests\/[^/]+/, 'Mock test details'],
];

const isRepresentedBy = (pathname: string, item: IRegisteredNavItem) =>
  pathname === item.to || (!item.end && pathname.startsWith(`${item.to}/`));

const getFallbackLabel = (pathname: string) => {
  const lastSegment = pathname.split('/').filter(Boolean).at(-1);

  if (!lastSegment || /^[0-9a-f-]{16,}$/i.test(lastSegment)) {
    return 'Current page';
  }

  try {
    const words = decodeURIComponent(lastSegment).replace(/[-_]+/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  } catch {
    return 'Current page';
  }
};

const getTemporaryItem = (
  pathname: string,
  search: string,
  hash: string,
  registeredItems: IRegisteredNavItem[]
): ICurrentPageNavItem | null => {
  if (pathname === '/settings' || pathname.startsWith('/settings/')) return null;
  if (pathname === '/admin/settings' || pathname.startsWith('/admin/settings/')) return null;
  if (registeredItems.some((item) => isRepresentedBy(pathname, item))) return null;

  return {
    label: routeLabels.find(([pattern]) => pattern.test(pathname))?.[1] ?? getFallbackLabel(pathname),
    to: `${pathname}${search}${hash}`,
  };
};

export const getTemporaryUserNavItem = (pathname: string, search = '', hash = '') =>
  getTemporaryItem(pathname, search, hash, userNavItems);

export const getTemporaryAdminNavItem = (pathname: string, search = '', hash = '') =>
  getTemporaryItem(pathname, search, hash, adminNavItems);
