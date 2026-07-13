import type { DashboardRecentActivityEntity } from '../entities/dashboard-recent-activity.entity';

export type GetRecentActivityInput = {
  userId: string;
  limit?: number;
};

export interface IDashboardNotificationRepository {
  getRecentActivity(input: GetRecentActivityInput): Promise<DashboardRecentActivityEntity[]>;

  getUnreadNotificationCount(userId: string): Promise<number>;
}
