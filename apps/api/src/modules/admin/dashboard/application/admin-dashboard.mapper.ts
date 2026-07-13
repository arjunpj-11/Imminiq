import type { AdminDashboardEntity } from '../domain/entities/admin-dashboard.entity'
import type { IAdminDashboardDTO } from './admin-dashboard.dto'

export interface IAdminDashboardMapper {
  toDTO(entity: AdminDashboardEntity): IAdminDashboardDTO
}

export class AdminDashboardMapper implements IAdminDashboardMapper {
  toDTO(entity: AdminDashboardEntity): IAdminDashboardDTO {
    return {
      metrics: { ...entity.metrics },
      weeklyActivity: [...entity.weeklyActivity],
      recentActivity: entity.recentActivity.map((activity) => ({
        ...activity,
        user: activity.user ? { ...activity.user } : null,
      })),
    }
  }
}
