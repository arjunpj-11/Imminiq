import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model';
import { MockTestAttemptModel } from '../../../../../infrastructure/database/models/mock-test-attempt.model';
import { MockTestModel } from '../../../../../infrastructure/database/models/mock-test.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import type { IAdminAnalyticsRepository } from '../../domain/repositories/admin-analytics.repository.interface';
export class MongoAdminAnalyticsRepository implements IAdminAnalyticsRepository {
  async get(days: number) {
    const since = new Date(Date.now() - days * 86400000);
    const verified = { deletedAt: null, $or: [{ emailVerified: true }, { phoneVerified: true }] };
    const [users, activeUsers, trackers, tests, attempts, dailyUsers, dailyActivity] =
      await Promise.all([
        User.countDocuments(verified),
        User.countDocuments({ ...verified, lastActiveAt: { $gte: since } }),
        Tracker.countDocuments({ deletedAt: null }),
        MockTestModel.countDocuments(),
        MockTestAttemptModel.countDocuments({ createdAt: { $gte: since } }),
        User.aggregate<{ _id: string; value: number }>([
          { $match: { ...verified, createdAt: { $gte: since } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              value: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        ActivityLog.aggregate<{ _id: string; value: number }>([
          { $match: { deletedAt: null, createdAt: { $gte: since } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              value: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);
    return {
      rangeDays: days,
      metrics: { users, activeUsers, trackers, tests, attempts },
      dailyUsers: dailyUsers.map((x) => ({ date: x._id, value: x.value })),
      dailyActivity: dailyActivity.map((x) => ({ date: x._id, value: x.value })),
    };
  }
}
export const mongoAdminAnalyticsRepository = new MongoAdminAnalyticsRepository();
