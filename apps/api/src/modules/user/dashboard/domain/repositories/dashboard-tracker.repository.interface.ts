import type { DashboardStatsEntity } from '../entities/dashboard-stats.entity';
import type { DashboardTrackerSummaryEntity } from '../entities/dashboard-tracker-summary.entity';

export interface IDashboardTrackerRepository {
  getTrackerOverview(userId: string): Promise<DashboardTrackerSummaryEntity>;

  getAggregatedStats(userId: string): Promise<DashboardStatsEntity>;
}
