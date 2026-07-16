import type { AdminDashboardEntity } from '../domain/entities/admin-dashboard.entity';
import type { AdminDashboardDTO } from './admin-dashboard.dto';

export interface IAdminDashboardMapper {
  toDTO(entity: AdminDashboardEntity): AdminDashboardDTO;
}

export class AdminDashboardMapper implements IAdminDashboardMapper {
  toDTO(entity: AdminDashboardEntity): AdminDashboardDTO {
    return {
      accessScope: 'full',
      metrics: { ...entity.metrics },
      weeklyActivity: [...entity.weeklyActivity],
      recentActivity: entity.recentActivity.map((activity) => ({
        ...activity,
        user: activity.user ? { ...activity.user } : null,
      })),
    };
  }
}
