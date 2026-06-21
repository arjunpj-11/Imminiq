import type { DashboardBattleEntity } from '../entities/dashboard-battle.entity'

export type GetRecentBattlesInput = {
  userId: string
  limit?: number
}

export interface DashboardBattleRepositoryContract {
  getRecentBattles(
    input: GetRecentBattlesInput
  ): Promise<DashboardBattleEntity[]>
}