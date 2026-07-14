import type { IDashboardStreakRepository } from '../../domain/repositories/dashboard-streak.repository.interface';
import type { DashboardActivityIntensityItemDTO } from '../dashboard.dto';
import type { IDashboardMapper } from '../dashboard.mapper';

export interface IGetActivityIntensityUseCase {
  execute(userId: string, months?: number): Promise<DashboardActivityIntensityItemDTO[]>;
}

export class GetActivityIntensityUseCase implements IGetActivityIntensityUseCase {
  constructor(
    private readonly _dashboardRepository: IDashboardStreakRepository,
    private readonly _dashboardMapper: IDashboardMapper
  ) {}

  async execute(userId: string, months?: number): Promise<DashboardActivityIntensityItemDTO[]> {
    const items = await this._dashboardRepository.getActivityIntensity({
      userId,
      months,
    });

    return items.map((item) => this._dashboardMapper.toActivityIntensity(item));
  }
}
