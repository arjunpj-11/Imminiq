export const ADMIN_SUPPORT_TICKETS_ROUTE_PATHS = {
  ROOT: '/',
  DETAIL: '/:id',
} as const;

export type AdminSupportTicketsRoutePath =
  (typeof ADMIN_SUPPORT_TICKETS_ROUTE_PATHS)[keyof typeof ADMIN_SUPPORT_TICKETS_ROUTE_PATHS];
