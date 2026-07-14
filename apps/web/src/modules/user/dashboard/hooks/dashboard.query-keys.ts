export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  currentRoadmap: () => [...dashboardKeys.all, 'current-roadmap'] as const,
  aiInsights: () => [...dashboardKeys.all, 'ai-insights'] as const,
  activityIntensity: (months: number) =>
    [...dashboardKeys.all, 'activity-intensity', months] as const,
  friendsHub: (limit: number) => [...dashboardKeys.all, 'friends-hub', limit] as const,
  recentBattles: (limit: number) => [...dashboardKeys.all, 'recent-battles', limit] as const,
  recommendedActions: () => [...dashboardKeys.all, 'recommended-actions'] as const,
};
