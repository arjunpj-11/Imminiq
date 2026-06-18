import type { DashboardRecommendationContext } from '../value-objects/dashboard-recommendation-context.vo'

export interface DashboardRecommendationRepositoryContract {
  getRecommendationContext(
    userId: string
  ): Promise<DashboardRecommendationContext>
}
