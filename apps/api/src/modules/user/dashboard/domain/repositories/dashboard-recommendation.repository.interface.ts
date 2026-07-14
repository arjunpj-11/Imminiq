import type { DashboardRecommendationContext } from '../value-objects/dashboard-recommendation-context.vo';

export interface IDashboardRecommendationRepository {
  getRecommendationContext(userId: string): Promise<DashboardRecommendationContext>;
}
