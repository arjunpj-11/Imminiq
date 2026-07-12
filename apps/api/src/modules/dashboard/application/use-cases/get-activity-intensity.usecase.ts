import type { IDashboardStreakRepository } from '../../domain/repositories/dashboard-streak.repository.interface'
import type { IDashboardActivityIntensityItemDTO } from '../dtos/dashboard.dto'
import type { IDashboardMapper } from '../mappers/dashboard.mapper'

export class GetActivityIntensityUseCase {
  constructor(
    private readonly _dashboardRepository: IDashboardStreakRepository,
    private readonly _dashboardMapper: IDashboardMapper
  ) {}

  async execute(
    userId: string,
    months?: number
  ): Promise<IDashboardActivityIntensityItemDTO[]> {
    const items = await this._dashboardRepository.getActivityIntensity({
      userId,
      months,
    })

    return items.map((item) => this._dashboardMapper.toActivityIntensity(item))
  }
}