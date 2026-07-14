export const SUBSCRIPTION_ROUTE_PATHS = {
  PLANS: '/plans',
  CURRENT: '/me',
  ORDERS: '/orders',
  VERIFY: '/verify',
} as const;

export type SubscriptionRoutePath =
  (typeof SUBSCRIPTION_ROUTE_PATHS)[keyof typeof SUBSCRIPTION_ROUTE_PATHS];
