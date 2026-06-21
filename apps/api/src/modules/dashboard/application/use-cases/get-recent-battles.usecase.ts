import type { DashboardBattleRepositoryContract } from '../../domain/repositories/dashboard-battle.repository.interface'
import type { DashboardBattleItem } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetRecentBattlesUseCase {
  constructor(
    private readonly dashboardRepository: DashboardBattleRepositoryContract,
    private readonly dashboardMapper: DashboardMapperContract
  ) {}

  async execute(userId: string, limit?: number): Promise<DashboardBattleItem[]> {
    const battles = await this.dashboardRepository.getRecentBattles({
      userId,
      limit,
    })

    return battles.map((battle) => this.dashboardMapper.toBattleItem(battle))
  }
}