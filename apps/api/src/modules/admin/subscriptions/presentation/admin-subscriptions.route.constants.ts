export const ADMIN_SUBSCRIPTIONS_ROUTE_PATHS = {
  ROOT: '/',
  PLAN: '/plans/:planId',
} as const;

export type AdminSubscriptionsRoutePath =
  (typeof ADMIN_SUBSCRIPTIONS_ROUTE_PATHS)[keyof typeof ADMIN_SUBSCRIPTIONS_ROUTE_PATHS];
