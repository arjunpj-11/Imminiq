import type { DashboardRepository } from '../../domain/repositories/dashboard.repository.interface'
import type { DashboardRecommendedAction } from '../../domain/types/dashboard.types'

export class GetRecommendedActionsUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(userId: string): Promise<DashboardRecommendedAction[]> {
    return this.dashboardRepository.getRecommendedActions(userId)
  }
}
