import { Tracker } from '../../../../../../infrastructure/database/models/tracker.model';
import { TrackerProgress } from '../../../../../../infrastructure/database/models/tracker-progress.model';
import { User } from '../../../../../../infrastructure/database/models/user.model';
import type { DashboardStatsEntity } from '../../../domain/entities/dashboard-stats.entity';
import type { DashboardTrackerSummaryEntity } from '../../../domain/entities/dashboard-tracker-summary.entity';
import type { DashboardRecommendationContext } from '../../../domain/value-objects/dashboard-recommendation-context.vo';
import type {
  MongoProgressAggregationRecord,
  MongoTrackerProgressRecord,
  MongoTrackerRecord,
  MongoTrackerTitleRecord,
  MongoUserRecord,
} from '../shared/mongo-dashboard.types';
import { MongoDashboardBaseRepository } from '../shared/mongo-dashboard-base.repository';
import { MongoDashboardErrorMapper } from '../shared/mongo-dashboard-error.mapper';
import { MongoDashboardMapper } from '../shared/mongo-dashboard.mapper';
import { MongoDashboardQueryUtils } from '../shared/mongo-dashboard-query.utils';

export class MongoDashboardTrackerRepository extends MongoDashboardBaseRepository {
  constructor(private readonly _mapper = new MongoDashboardMapper()) {
    super();
  }

  async getTrackerOverview(userId: string): Promise<DashboardTrackerSummaryEntity> {
    return this.execute(
      'DASHBOARD_TRACKER_READ_FAILED',
      'Failed to read dashboard trackers',
      async () => {
        const [allTrackers, allProgress] = await Promise.all([
          Tracker.find({
            ownerId: userId,
            status: { $ne: 'archived' },
            deletedAt: null,
          })
            .select('_id title level updatedAt topicsCount')
            .sort({ updatedAt: -1 })
            .lean<MongoTrackerRecord[]>(),
          TrackerProgress.find({
            userId,
            deletedAt: null,
          })
            .select('trackerId completionPercentage lastStudiedAt completedTopics')
            .lean<MongoTrackerProgressRecord[]>(),
        ]);

        const progressMap = new Map(
          allProgress.map((progress) => [this._mapper.toId(progress.trackerId), progress])
        );

        const trackersWithProgress = allTrackers.map((tracker) =>
          this._mapper.toDashboardActiveTrackerEntity(
            tracker,
            progressMap.get(this._mapper.toId(tracker._id))
          )
        );

        return this._mapper.toDashboardTrackerSummaryEntity(trackersWithProgress);
      },
      MongoDashboardErrorMapper.mapMongoError
    );
  }

  async getAggregatedStats(userId: string): Promise<DashboardStatsEntity> {
    return this.execute(
      'DASHBOARD_STATS_READ_FAILED',
      'Failed to read dashboard statistics',
      async () => {
        const userObjectId = MongoDashboardQueryUtils.toObjectId(userId);

        const [progressAggregation, publishedTrackers, user] = await Promise.all([
          TrackerProgress.aggregate<MongoProgressAggregationRecord>([
            {
              $match: {
                userId: userObjectId,
                deletedAt: null,
              },
            },
            {
              $group: {
                _id: null,
                totalSubtopicsCompleted: {
                  $sum: { $ifNull: ['$completedSubtopics', 0] },
                },
              },
            },
          ]),
          Tracker.countDocuments({
            ownerId: userId,
            visibility: 'public',
            deletedAt: null,
            moderationStatus: { $in: ['active', null] },
          }),
          User.findOne({
            _id: userId,
            deletedAt: null,
          })
            .select('coins')
            .lean<Pick<MongoUserRecord, 'coins'>>(),
        ]);

        return this._mapper.toDashboardStatsEntity(progressAggregation[0], publishedTrackers, user);
      },
      MongoDashboardErrorMapper.mapMongoError
    );
  }

  async getRecommendationContext(userId: string): Promise<DashboardRecommendationContext> {
    return this.execute(
      'DASHBOARD_RECOMMENDATION_READ_FAILED',
      'Failed to read dashboard recommendation context',
      async () => {
        const [latestProgress, totalTrackers] = await Promise.all([
          TrackerProgress.findOne({
            userId,
            completionPercentage: { $lt: 100 },
            deletedAt: null,
          })
            .sort({ lastStudiedAt: -1 })
            .select('trackerId completionPercentage lastStudiedAt')
            .lean<MongoTrackerProgressRecord>(),
          Tracker.countDocuments({
            ownerId: userId,
            deletedAt: null,
          }),
        ]);

        const tracker = latestProgress
          ? await Tracker.findOne({
              _id: latestProgress.trackerId,
              ownerId: userId,
              deletedAt: null,
            })
              .select('_id title')
              .lean<MongoTrackerTitleRecord>()
          : null;

        return this._mapper.toDashboardRecommendationContext(
          totalTrackers,
          latestProgress,
          tracker
        );
      },
      MongoDashboardErrorMapper.mapMongoError
    );
  }
}

export const mongoDashboardTrackerRepository = new MongoDashboardTrackerRepository();
