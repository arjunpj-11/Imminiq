export const adminAnalyticsKeys = {
  all: ['admin', 'analytics'] as const,
  range: (range: { from: string; to: string }) => [...adminAnalyticsKeys.all, range] as const,
};
