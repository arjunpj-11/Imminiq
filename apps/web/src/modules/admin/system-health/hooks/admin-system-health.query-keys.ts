export const adminSystemHealthKeys = {
  all: ['admin', 'system-health'] as const,
  status: () => [...adminSystemHealthKeys.all, 'status'] as const,
  jobs: (query: Record<string, unknown>) => [...adminSystemHealthKeys.all, 'jobs', query] as const,
};
