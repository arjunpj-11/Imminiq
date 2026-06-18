import type { DashboardStatsEntity } from '../entities/dashboard-stats.entity'
import type { DashboardTrackerSummaryEntity } from '../entities/dashboard-tracker-summary.entity'

export interface DashboardTrackerRepositoryContract {
  getTrackerOverview(userId: string): Promise<DashboardTrackerSummaryEntity>
  getAggregatedStats(userId: string): Promise<DashboardStatsEntity>
}
