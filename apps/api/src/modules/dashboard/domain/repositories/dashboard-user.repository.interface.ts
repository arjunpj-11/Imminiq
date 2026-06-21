import type { DashboardUserEntity } from '../entities/dashboard-user.entity'

export interface DashboardUserRepositoryContract {
  findUserById(userId: string): Promise<DashboardUserEntity | null>
}