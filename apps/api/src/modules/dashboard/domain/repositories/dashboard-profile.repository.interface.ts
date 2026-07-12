import type { DashboardProfileEntity } from '../entities/dashboard-profile.entity'

export interface IDashboardProfileRepository {
  findProfileByUserId(userId: string): Promise<DashboardProfileEntity | null>
}