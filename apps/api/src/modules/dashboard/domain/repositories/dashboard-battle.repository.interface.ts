import type { DashboardBattleEntity } from '../entities/dashboard-battle.entity'

export interface DashboardBattleRepositoryContract {
  getRecentBattles(
    userId: string,
    limit?: number
  ): Promise<DashboardBattleEntity[]>
}
