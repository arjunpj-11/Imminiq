import type { DashboardBattleRepositoryContract } from '../../domain/repositories/dashboard-battle.repository.interface'
import type { DashboardBattleItem } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetRecentBattlesUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardBattleRepositoryContract,
    private readonly _dashboardMapper: DashboardMapperContract
  ) {}

  async execute(userId: string, limit?: number): Promise<DashboardBattleItem[]> {
    const battles = await this._dashboardRepository.getRecentBattles({
      userId,
      limit,
    })

    return battles.map((battle) => this._dashboardMapper.toBattleItem(battle))
  }
}