export type DashboardActiveTrackerSnapshot = {
  id: string
  title: string
  level: string
  completionPercentage: number
  lastStudiedAt: Date | null
  totalTopics: number
  completedTopics: number
  remainingTopics: number
  updatedAt: Date | null
}
