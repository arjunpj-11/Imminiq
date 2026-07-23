import { ADMIN_ROUTES } from '../../../../routes/config/route-paths';

export const ADMIN_SUPPORT_TICKETS_ENDPOINTS = {
  list: '/admin/support-tickets',
  update: (ticketId: string) => `/admin/support-tickets/${ticketId}`,
} as const;

export const ADMIN_SUPPORT_TICKETS_ROUTES = {
  list: ADMIN_ROUTES.supportTickets,
} as const;

export const ADMIN_SUPPORT_TICKETS_STALE_TIME_MS = 15_000;
