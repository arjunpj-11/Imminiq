import type { DashboardRepository } from '../../domain/repositories/dashboard.repository.interface'
import type { DashboardActivityIntensityItem } from '../../domain/types/dashboard.types'

export class GetActivityIntensityUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(
    userId: string,
    months?: number
  ): Promise<DashboardActivityIntensityItem[]> {
    return this.dashboardRepository.getActivityIntensity(userId, months)
  }
}
