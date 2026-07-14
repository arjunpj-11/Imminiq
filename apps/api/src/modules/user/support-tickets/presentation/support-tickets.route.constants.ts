export const SUPPORT_TICKET_ROUTE_PATHS = {
  ROOT: '/',
} as const;

export type SupportTicketRoutePath =
  (typeof SUPPORT_TICKET_ROUTE_PATHS)[keyof typeof SUPPORT_TICKET_ROUTE_PATHS];
