import type { AdminSystemHealth } from '../admin-system-health.entity';
export interface IAdminSystemHealthRepository {
  inspect(): Promise<AdminSystemHealth>;
}
