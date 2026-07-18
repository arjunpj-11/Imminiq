import { ADMIN_ROUTES, ROUTES } from '../routes/config/route-paths';

export interface ICurrentPageNavItem {
  label: string;
  to: string;
}

interface IRegisteredNavItem {
  to: string;
  end?: boolean;
}

const userNavItems: IRegisteredNavItem[] = [
  { to: ROUTES.dashboard, end: true },
  { to: ROUTES.trackers },
  { to: ROUTES.mockTests },
  { to: ROUTES.learningAgent },
  { to: ROUTES.community },
  { to: ROUTES.leaderboard },
  { to: ROUTES.activity },
];

const adminNavItems: IRegisteredNavItem[] = [
  { to: ADMIN_ROUTES.dashboard, end: true },
  { to: ADMIN_ROUTES.users },
  { to: ADMIN_ROUTES.trackers },
  { to: ADMIN_ROUTES.mockTests },
  { to: ADMIN_ROUTES.activity },
  { to: ADMIN_ROUTES.broadcast },
  { to: ADMIN_ROUTES.subscriptions },
  { to: ADMIN_ROUTES.auditLogs },
  { to: ADMIN_ROUTES.systemHealth },
  { to: ADMIN_ROUTES.aiTokenSpend },
  { to: ADMIN_ROUTES.supportTickets },
  { to: ADMIN_ROUTES.legacySupport },
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const nestedRoute = (route: string, suffix = '') => new RegExp(`^${escapeRegExp(route)}${suffix}`);

const routeLabels: Array<[RegExp, string]> = [
  [nestedRoute(ADMIN_ROUTES.users, '/[^/]+'), 'User details'],
  [nestedRoute(ADMIN_ROUTES.trackerReviews), 'Community reviews'],
  [nestedRoute(ADMIN_ROUTES.publishedTrackers), 'Published trackers'],
  [nestedRoute(ADMIN_ROUTES.trackers, '/[^/]+'), 'Tracker details'],
  [nestedRoute(ADMIN_ROUTES.mockTests, '/[^/]+'), 'Mock test details'],
  [nestedRoute(ROUTES.notifications), 'Notifications'],
  [nestedRoute(ROUTES.profile, '(?:/|$)'), 'Profile'],
  [nestedRoute(ROUTES.verifyAndEarn), 'Verify and earn'],
  [nestedRoute(ROUTES.pricing), 'Plans'],
  [nestedRoute(ROUTES.support), 'Support'],
  [nestedRoute(ROUTES.friendsSearch), 'Find people'],
  [nestedRoute(ROUTES.friends), 'Friends'],
  [nestedRoute(ROUTES.publishedTrackers), 'Published trackers'],
  [nestedRoute(ROUTES.trackers, '/[^/]+/manage'), 'Manage tracker'],
  [nestedRoute(ROUTES.trackers, '/[^/]+/roadmap'), 'Tracker roadmap'],
  [nestedRoute(ROUTES.trackers, '/[^/]+/clan'), 'Tracker guild'],
  [nestedRoute(ROUTES.community, '/verify'), 'Verify submission'],
  [nestedRoute(ROUTES.community, '/trackers'), 'Community tracker'],
  [nestedRoute(ROUTES.leaderboardRewards), 'Rewards'],
  [nestedRoute(ROUTES.mockTests, '/generating'), 'Generating mock test'],
  [nestedRoute(ROUTES.mockTests, '/attempts/.+/result'), 'Test result'],
  [nestedRoute(ROUTES.mockTests, '/attempts/.+/analysis'), 'Test analysis'],
  [nestedRoute(ROUTES.mockTests, '/[^/]+'), 'Mock test details'],
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
  if (pathname === ROUTES.settingsRoot || pathname.startsWith(`${ROUTES.settingsRoot}/`)) {
    return null;
  }
  if (pathname === ADMIN_ROUTES.settings || pathname.startsWith(`${ADMIN_ROUTES.settings}/`))
    return null;
  if (registeredItems.some((item) => isRepresentedBy(pathname, item))) return null;

  return {
    label:
      routeLabels.find(([pattern]) => pattern.test(pathname))?.[1] ?? getFallbackLabel(pathname),
    to: `${pathname}${search}${hash}`,
  };
};

export const getTemporaryUserNavItem = (pathname: string, search = '', hash = '') =>
  getTemporaryItem(pathname, search, hash, userNavItems);

export const getTemporaryAdminNavItem = (pathname: string, search = '', hash = '') =>
  getTemporaryItem(pathname, search, hash, adminNavItems);
