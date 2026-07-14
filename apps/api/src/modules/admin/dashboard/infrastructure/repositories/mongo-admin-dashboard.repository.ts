import { User } from '../../../../../infrastructure/database/models/user.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model';
import type { AdminDashboardEntity } from '../../domain/entities/admin-dashboard.entity';
import type { IAdminDashboardRepository } from '../../domain/repositories/admin-dashboard.repository.interface';

export class MongoAdminDashboardRepository implements IAdminDashboardRepository {
  async getOverview(): Promise<AdminDashboardEntity> {
    const sinceToday = new Date();
    sinceToday.setHours(0, 0, 0, 0);
    const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const verified = { $or: [{ emailVerified: true }, { phoneVerified: true }] };
    const [totalUsers, activeToday, blockedUsers, totalTrackers, recentActivity, weeklyActivity] =
      await Promise.all([
        User.countDocuments({ deletedAt: null, ...verified }),
        User.countDocuments({ deletedAt: null, lastActiveAt: { $gte: sinceToday }, ...verified }),
        User.countDocuments({ deletedAt: null, status: 'blocked', ...verified }),
        Tracker.countDocuments({ deletedAt: null }),
        ActivityLog.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean(),
        ActivityLog.aggregate<{ _id: number; count: number }>([
          { $match: { deletedAt: null, createdAt: { $gte: sinceWeek } } },
          { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
        ]),
      ]);
    const activityUsers = await User.find({
      _id: { $in: recentActivity.map((item) => item.userId) },
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
      metrics: { totalUsers, activeToday, blockedUsers, totalTrackers },
      weeklyActivity: [2, 3, 4, 5, 6, 7, 1].map((day) => weeklyMap.get(day) ?? 0),
      recentActivity: recentActivity.map((item) => ({
        id: String(item._id),
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
