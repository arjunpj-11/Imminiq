import type { DashboardAIInsightResult } from './application/dtos/dashboard.dto'
import {
  createDashboardComposition,
  type DashboardComposition,
} from './dashboard.factory'

export class DashboardService {
  private readonly _useCases: DashboardComposition['useCases']

  constructor(composition: DashboardComposition) {
    this._useCases = composition.useCases
  }

  getSummary(userId: string) {
    return this._useCases.getDashboardSummary.execute(userId)
  }

  getCurrentRoadmap(userId: string) {
    return this._useCases.getCurrentRoadmap.execute(userId)
  }

  getActivityIntensity(userId: string, months?: number) {
    return this._useCases.getActivityIntensity.execute(userId, months)
  }

  getRecentBattles(userId: string, limit?: number) {
    return this._useCases.getRecentBattles.execute(userId, limit)
  }

  getFriendsHub(userId: string, limit?: number) {
    return this._useCases.getFriendsHub.execute(userId, limit)
  }

  getRecommendedActions(userId: string) {
    return this._useCases.getRecommendedActions.execute(userId)
  }

  getAIInsights(userId: string): Promise<DashboardAIInsightResult> {
    return this._useCases.getAIInsights.execute(userId)
  }
}

export const dashboardService = new DashboardService(
  createDashboardComposition()
)