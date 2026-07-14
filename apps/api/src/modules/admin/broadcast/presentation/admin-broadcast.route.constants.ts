export const ADMIN_BROADCAST_ROUTE_PATHS = {
  ROOT: '/',
} as const;

export type AdminBroadcastRoutePath =
  (typeof ADMIN_BROADCAST_ROUTE_PATHS)[keyof typeof ADMIN_BROADCAST_ROUTE_PATHS];
