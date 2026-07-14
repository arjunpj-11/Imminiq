import type { AdminSystemHealth } from '../entities/admin-system-health.entity';
export interface IAdminSystemHealthRepository {
  inspect(): Promise<AdminSystemHealth>;
}
