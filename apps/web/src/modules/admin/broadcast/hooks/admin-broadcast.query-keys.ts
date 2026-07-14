export const adminBroadcastKeys = {
  all: ['admin', 'broadcasts'] as const,
  list: (page: number) => [...adminBroadcastKeys.all, 'list', page] as const,
};
