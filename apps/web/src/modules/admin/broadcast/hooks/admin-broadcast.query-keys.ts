export const adminBroadcastKeys = {
  all: ['admin', 'broadcasts'] as const,
  list: (page: number, search: string) =>
    [...adminBroadcastKeys.all, 'list', page, search] as const,
};
