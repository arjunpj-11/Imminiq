import type { DashboardProfileEntity } from '../entities/dashboard-profile.entity'

export interface DashboardProfileRepositoryContract {
  findProfileByUserId(userId: string): Promise<DashboardProfileEntity | null>
}