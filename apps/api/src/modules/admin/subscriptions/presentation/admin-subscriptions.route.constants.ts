export const ADMIN_SUBSCRIPTIONS_ROUTE_PATHS = {
  ROOT: '/',
  PLAN_LIMITS: '/plans/:planId/limits',
} as const;

export type AdminSubscriptionsRoutePath =
  (typeof ADMIN_SUBSCRIPTIONS_ROUTE_PATHS)[keyof typeof ADMIN_SUBSCRIPTIONS_ROUTE_PATHS];
