import { User } from '../../../../../infrastructure/database/models/user.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model';
import { MockTestQuestionIssueModel } from '../../../../../infrastructure/database/models/mock-test-question-issue.model';
import { MockTestModel } from '../../../../../infrastructure/database/models/mock-test.model';
import { SupportTicket } from '../../../../../infrastructure/database/models/support-ticket.model';
import { TrackerReport } from '../../../../../infrastructure/database/models/tracker-report.model';
import { SecurityAuditEvent } from '../../../../../infrastructure/database/models/security-audit-event.model';
import { ContentModerationAppeal } from '../../../../../infrastructure/database/models/content-moderation-appeal.model';
import { DataPrivacyRequest } from '../../../../../infrastructure/database/models/data-privacy-request.model';
import type { AdminDashboardEntity } from '../../domain/entities/admin-dashboard.entity';
import type { IAdminDashboardRepository } from '../../domain/repositories/admin-dashboard.repository.interface';

export class MongoAdminDashboardRepository implements IAdminDashboardRepository {
  async getOverview(): Promise<AdminDashboardEntity> {
    const sinceToday = new Date();
    sinceToday.setHours(0, 0, 0, 0);
    const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const moderationSlaCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [
      totalUsers,
      activeToday,
      blockedUsers,
      suspendedUsers,
      totalTrackers,
      openQuestionReports,
      reviewingQuestionReports,
      urgentSupportTickets,
      suspendedMockTests,
      openTrackerReports,
      suspendedTrackers,
      overdueQuestionReports,
      overdueTrackerReports,
      pendingContentAppeals,
      pendingPrivacyRequests,
      overduePrivacyRequests,
      recentActivity,
      recentSecurityActivity,
      weeklyActivity,
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      User.countDocuments({ deletedAt: null, lastActiveAt: { $gte: sinceToday } }),
      User.countDocuments({ deletedAt: null, status: 'blocked' }),
      User.countDocuments({ deletedAt: null, status: 'paused' }),
      Tracker.countDocuments({ deletedAt: null }),
      MockTestQuestionIssueModel.countDocuments({ status: 'open' }),
      MockTestQuestionIssueModel.countDocuments({ status: 'reviewing' }),
      SupportTicket.countDocuments({
        priority: 'urgent',
        status: { $in: ['open', 'in_progress'] },
      }),
      MockTestModel.countDocuments({ moderationStatus: 'suspended', deletedAt: null }),
      TrackerReport.countDocuments({ status: { $in: ['open', 'reviewing'] } }),
      Tracker.countDocuments({ moderationStatus: 'suspended', deletedAt: null }),
      MockTestQuestionIssueModel.countDocuments({
        status: { $in: ['open', 'reviewing'] },
        createdAt: { $lt: moderationSlaCutoff },
      }),
      TrackerReport.countDocuments({
        status: { $in: ['open', 'reviewing'] },
        createdAt: { $lt: moderationSlaCutoff },
      }),
      ContentModerationAppeal.countDocuments({
        status: { $in: ['pending', 'under_review'] },
        deletedAt: null,
      }),
      DataPrivacyRequest.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      DataPrivacyRequest.countDocuments({
        status: { $in: ['pending', 'in_progress'] },
        dueAt: { $lt: new Date() },
      }),
      ActivityLog.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean(),
      SecurityAuditEvent.find({}).sort({ createdAt: -1 }).limit(8).lean(),
      ActivityLog.aggregate<{ _id: number; count: number }>([
        { $match: { deletedAt: null, createdAt: { $gte: sinceWeek } } },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
      ]),
    ]);
    const mergedActivity = [
      ...recentActivity.map((item) => ({
        id: String(item._id),
        userId: item.userId,
        action: item.action,
        module: item.module,
        severity: item.severity,
        createdAt: item.createdAt,
      })),
      ...recentSecurityActivity.map((item) => ({
        id: String(item._id),
        userId: item.userId,
        action: item.eventType,
        module: 'admin.users',
        severity: item.outcome === 'failure' ? 'error' : 'warning',
        createdAt: item.createdAt,
      })),
    ]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, 8);
    const activityUsers = await User.find({
      _id: { $in: mergedActivity.map((item) => item.userId) },
    })
      .select('fullName username')
      .lean();
    const userById = new Map(
      activityUsers.map((user) => [
        String(user._id),
        { fullName: user.fullName, username: user.username },
      ])
    );
    const weeklyMap = new Map(weeklyActivity.map((item) => [item._id, item.count]));
    return {
      generatedAt: new Date(),
      metrics: {
        totalUsers,
        activeToday,
        blockedUsers,
        suspendedUsers,
        totalTrackers,
        openQuestionReports,
        reviewingQuestionReports,
        urgentSupportTickets,
        suspendedMockTests,
        openTrackerReports,
        suspendedTrackers,
        overdueQuestionReports,
        overdueTrackerReports,
        pendingContentAppeals,
        pendingPrivacyRequests,
        overduePrivacyRequests,
      },
      weeklyActivity: [2, 3, 4, 5, 6, 7, 1].map((day) => weeklyMap.get(day) ?? 0),
      recentActivity: mergedActivity.map((item) => ({
        id: item.id,
        action: item.action,
        module: item.module,
        severity: item.severity,
        createdAt: item.createdAt,
        user: userById.get(String(item.userId)) ?? null,
      })),
    };
  }
}

export const mongoAdminDashboardRepository = new MongoAdminDashboardRepository();
