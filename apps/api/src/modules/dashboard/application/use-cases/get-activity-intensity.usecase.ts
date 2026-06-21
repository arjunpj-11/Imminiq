import type { DashboardStreakRepositoryContract } from '../../domain/repositories/dashboard-streak.repository.interface'
import type { DashboardActivityIntensityItem } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetActivityIntensityUseCase {
  constructor(
    private readonly dashboardRepository: DashboardStreakRepositoryContract,
    private readonly dashboardMapper: DashboardMapperContract
  ) {}

  async execute(
    userId: string,
    months?: number
  ): Promise<DashboardActivityIntensityItem[]> {
    const items = await this.dashboardRepository.getActivityIntensity({
      userId,
      months,
    })

    return items.map((item) => this.dashboardMapper.toActivityIntensity(item))
  }
}