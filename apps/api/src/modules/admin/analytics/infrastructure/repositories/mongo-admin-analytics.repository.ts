import { ActivityLog } from '../../../../../infrastructure/database/models/activity-log.model';
import { MockTestAttemptModel } from '../../../../../infrastructure/database/models/mock-test-attempt.model';
import { MockTestModel } from '../../../../../infrastructure/database/models/mock-test.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import type { IAdminAnalyticsRepository } from '../../domain/repositories/admin-analytics.repository.interface';
export class MongoAdminAnalyticsRepository implements IAdminAnalyticsRepository {
  async get({ from, to, days }: import('../../domain/admin-analytics.entity').AdminAnalyticsRange) {
    const createdAt = { $gte: from, $lte: to };
    const verified = { deletedAt: null, $or: [{ emailVerified: true }, { phoneVerified: true }] };
    const [users, activeUsers, trackers, tests, attempts, dailyUsers, dailyActivity] =
      await Promise.all([
        User.countDocuments(verified),
        User.countDocuments({ ...verified, lastActiveAt: createdAt }),
        Tracker.countDocuments({ deletedAt: null }),
        MockTestModel.countDocuments(),
        MockTestAttemptModel.countDocuments({ createdAt }),
        User.aggregate<{ _id: string; value: number }>([
          { $match: { ...verified, createdAt } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              value: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        ActivityLog.aggregate<{ _id: string; value: number }>([
          { $match: { deletedAt: null, createdAt } },
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
      rangeFrom: from.toISOString().slice(0, 10),
      rangeTo: to.toISOString().slice(0, 10),
      metrics: { users, activeUsers, trackers, tests, attempts },
      dailyUsers: dailyUsers.map((x) => ({ date: x._id, value: x.value })),
      dailyActivity: dailyActivity.map((x) => ({ date: x._id, value: x.value })),
    };
  }
}
export const mongoAdminAnalyticsRepository = new MongoAdminAnalyticsRepository();
