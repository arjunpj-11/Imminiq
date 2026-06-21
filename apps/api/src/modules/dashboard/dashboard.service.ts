import type { DashboardAIInsightResult } from './application/dtos/dashboard.dto'
import {
  createDashboardComposition,
  type DashboardComposition,
} from './dashboard.factory'

export class DashboardService {
  private readonly useCases: DashboardComposition['useCases']

  constructor(composition: DashboardComposition) {
    this.useCases = composition.useCases
  }

  getSummary(userId: string) {
    return this.useCases.getDashboardSummary.execute(userId)
  }

  getCurrentRoadmap(userId: string) {
    return this.useCases.getCurrentRoadmap.execute(userId)
  }

  getActivityIntensity(userId: string, months?: number) {
    return this.useCases.getActivityIntensity.execute(userId, months)
  }

  getRecentBattles(userId: string, limit?: number) {
    return this.useCases.getRecentBattles.execute(userId, limit)
  }

  getFriendsHub(userId: string, limit?: number) {
    return this.useCases.getFriendsHub.execute(userId, limit)
  }

  getRecommendedActions(userId: string) {
    return this.useCases.getRecommendedActions.execute(userId)
  }

  getAIInsights(userId: string): Promise<DashboardAIInsightResult> {
    return this.useCases.getAIInsights.execute(userId)
  }
}

export const dashboardService = new DashboardService(
  createDashboardComposition()
)