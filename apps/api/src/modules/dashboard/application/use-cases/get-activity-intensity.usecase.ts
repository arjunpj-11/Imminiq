import type { DashboardStreakRepositoryContract } from '../../domain/repositories/dashboard-streak.repository.interface'
import type { DashboardActivityIntensityItem } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetActivityIntensityUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardStreakRepositoryContract,
    private readonly _dashboardMapper: DashboardMapperContract
  ) {}

  async execute(
    userId: string,
    months?: number
  ): Promise<DashboardActivityIntensityItem[]> {
    const items = await this._dashboardRepository.getActivityIntensity({
      userId,
      months,
    })

    return items.map((item) => this._dashboardMapper.toActivityIntensity(item))
  }
}