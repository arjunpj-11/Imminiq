export const ADMIN_SYSTEM_HEALTH_ROUTE_PATHS = {
  ROOT: '/',
  JOBS: '/jobs',
  JOB_ACTION: '/queues/:queueName/jobs/:jobId',
} as const;

export type AdminSystemHealthRoutePath =
  (typeof ADMIN_SYSTEM_HEALTH_ROUTE_PATHS)[keyof typeof ADMIN_SYSTEM_HEALTH_ROUTE_PATHS];
