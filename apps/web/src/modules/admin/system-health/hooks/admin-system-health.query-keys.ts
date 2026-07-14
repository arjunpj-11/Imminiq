export const adminSystemHealthKeys = {
  all: ['admin', 'system-health'] as const,
  status: () => [...adminSystemHealthKeys.all, 'status'] as const,
};
