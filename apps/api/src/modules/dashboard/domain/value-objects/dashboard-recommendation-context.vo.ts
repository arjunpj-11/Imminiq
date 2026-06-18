export type DashboardRecommendationTracker = {
  id: string
  title: string
  completionPercentage: number
}

export type DashboardRecommendationContext = {
  totalTrackers: number
  latestIncompleteTracker: DashboardRecommendationTracker | null
}
