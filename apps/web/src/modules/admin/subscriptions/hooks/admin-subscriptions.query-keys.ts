export type AdminSubscriptionsQuery = {
  search?: string;
  status?: string;
  page?: number;
};

export const adminSubscriptionsKeys = {
  all: ['admin', 'subscriptions'] as const,
  overview: (query: AdminSubscriptionsQuery) =>
    [...adminSubscriptionsKeys.all, 'overview', query] as const,
};
