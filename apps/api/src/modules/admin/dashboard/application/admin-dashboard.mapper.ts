import type { AdminDashboardEntity } from '../domain/entities/admin-dashboard.entity';
import type { AdminDashboardDTO } from './admin-dashboard.dto';

export interface IAdminDashboardMapper {
  toDTO(entity: AdminDashboardEntity): AdminDashboardDTO;
}

export class AdminDashboardMapper implements IAdminDashboardMapper {
  toDTO(entity: AdminDashboardEntity): AdminDashboardDTO {
    return {
      accessScope: 'full',
      generatedAt: entity.generatedAt,
      metrics: {
        totalUsers: entity.metrics.totalUsers,
        activeToday: entity.metrics.activeToday,
        blockedUsers: entity.metrics.blockedUsers,
        suspendedUsers: entity.metrics.suspendedUsers,
        totalTrackers: entity.metrics.totalTrackers,
        openQuestionReports: entity.metrics.openQuestionReports,
        reviewingQuestionReports: entity.metrics.reviewingQuestionReports,
        urgentSupportTickets: entity.metrics.urgentSupportTickets,
        suspendedMockTests: entity.metrics.suspendedMockTests,
        openTrackerReports: entity.metrics.openTrackerReports,
        suspendedTrackers: entity.metrics.suspendedTrackers,
        overdueQuestionReports: entity.metrics.overdueQuestionReports,
        overdueTrackerReports: entity.metrics.overdueTrackerReports,
        pendingContentAppeals: entity.metrics.pendingContentAppeals,
        pendingPrivacyRequests: entity.metrics.pendingPrivacyRequests,
        overduePrivacyRequests: entity.metrics.overduePrivacyRequests,
      },
      weeklyActivity: [...entity.weeklyActivity],
      recentActivity: entity.recentActivity.map((activity) => ({
        ...activity,
        user: activity.user ? { ...activity.user } : null,
      })),
    };
  }
}
