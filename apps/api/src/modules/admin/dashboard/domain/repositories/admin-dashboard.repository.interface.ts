import type { AdminDashboardEntity } from '../entities/admin-dashboard.entity';

export interface IAdminDashboardRepository {
  getOverview(): Promise<AdminDashboardEntity>;
}
