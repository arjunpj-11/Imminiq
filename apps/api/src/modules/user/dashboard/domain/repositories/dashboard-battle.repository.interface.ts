import type { DashboardBattleEntity } from '../entities/dashboard-battle.entity';

export type GetRecentBattlesInput = {
  userId: string;
  limit?: number;
};

export interface IDashboardBattleRepository {
  getRecentBattles(input: GetRecentBattlesInput): Promise<DashboardBattleEntity[]>;
}
