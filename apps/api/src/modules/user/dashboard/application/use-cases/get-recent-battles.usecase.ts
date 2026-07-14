import type { IDashboardBattleRepository } from '../../domain/repositories/dashboard-battle.repository.interface';
import type { DashboardBattleItemDTO } from '../dashboard.dto';
import type { IDashboardMapper } from '../dashboard.mapper';

export interface IGetRecentBattlesUseCase {
  execute(userId: string, limit?: number): Promise<DashboardBattleItemDTO[]>;
}

export class GetRecentBattlesUseCase implements IGetRecentBattlesUseCase {
  constructor(
    private readonly _dashboardRepository: IDashboardBattleRepository,
    private readonly _dashboardMapper: IDashboardMapper
  ) {}

  async execute(userId: string, limit?: number): Promise<DashboardBattleItemDTO[]> {
    const battles = await this._dashboardRepository.getRecentBattles({
      userId,
      limit,
    });

    return battles.map((battle) => this._dashboardMapper.toBattleItem(battle));
  }
}
