import type { DashboardUserEntity } from '../entities/dashboard-user.entity';

export interface IDashboardUserRepository {
  findUserById(userId: string): Promise<DashboardUserEntity | null>;
}
