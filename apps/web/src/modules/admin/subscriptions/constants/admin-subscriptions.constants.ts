import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_SUBSCRIPTIONS_ENDPOINTS = {
  overview: '/admin/subscriptions',
  planLimits: (planId: string) => `/admin/subscriptions/plans/${planId}/limits`,
} as const;

export const ADMIN_SUBSCRIPTIONS_ROUTES = {
  overview: ADMIN_ROUTES.subscriptions,
} as const;

export const ADMIN_SUBSCRIPTIONS_STALE_TIME_MS = 30_000;
export const ADMIN_SUBSCRIPTION_STATUS_OPTIONS = [
  'all',
  'active',
  'pending',
  'expired',
  'canceled',
  'failed',
] as const;
