import mongoose from 'mongoose';

import { LeaderboardXpEvent } from '../../../../../../infrastructure/database/models/leaderboard-xp-event.model';
import { StreakHistory } from '../../../../../../infrastructure/database/models/streak-history.model';
import { StreakSnapshot } from '../../../../../../infrastructure/database/models/streak-snapshot.model';
import { UserActivity } from '../../../../../../infrastructure/database/models/user-activity.model';
import { User } from '../../../../../../infrastructure/database/models/user.model';
import { ACTIVITY_SESSION_TYPES } from '../../../domain/activity.constants';
import { ActivityDomainError } from '../../../domain/activity-domain.error';
import type {
  IActivityQueryRepository,
  FindActivityAnalyticsInput,
  FindActivityFeedInput,
  FindActivityFeedResult,
  FindDailyGoalStateInput,
} from '../../../domain/repositories/activity-query.repository.interface';
import type {
  ActivityAnalyticsRecord,
  ActivityDayAggregateRecord,
  ActivityStreakAnalyticsRecord,
  ActivityWeeklyBreakdownRecord,
} from '../../../domain/activity.types';
import type { ActivityCategory } from '../../../domain/value-objects/activity-category.vo';
import type { ActivityHeatmapIntensity } from '../../../domain/value-objects/activity-heatmap-intensity.vo';
import { MongoActivityBaseRepository } from '../shared/mongo-activity-base.repository';
import { MongoActivityFilterBuilder } from '../shared/mongo-activity-filter.builder';
import { MongoActivityMapper } from '../shared/mongo-activity.mapper';
import type {
  MongoActivityBestDayRecord,
  MongoActivityBestTestRecord,
  MongoActivityBestWeekRecord,
  MongoActivityBreakdownRecord,
  MongoActivityDayAggregateRecord,
  MongoActivityStatisticsRecord,
  MongoActivityTypeSetRecord,
  MongoActivityUserRecord,
  MongoActivityXpRecord,
  MongoUserActivityRecord,
} from '../shared/mongo-activity.types';

const DAY_IN_MS = 86_400_000;
const SESSION_TYPES = [...ACTIVITY_SESSION_TYPES];

type LeaderboardDayXpRecord = {
  _id: string;
  xp?: number;
};

type LeaderboardRangeXpRecord = {
  _id?: null;
  xp?: number;
  eventCount?: number;
};

type LeaderboardBreakdownRecord = {
  _id: {
    category?: ActivityCategory | null;
    source?: string | null;
  };
  xp?: number;
};

type StreakHistoryLeanRecord = {
  date: Date;
  activityCount?: number;
  intensityLevel?: ActivityHeatmapIntensity;
  streakDay?: number;
  isFrozen?: boolean;
};

type StreakSnapshotLeanRecord = {
  snapshotDate: Date;
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  totalFreezeUsed?: number;
};

type StreakTotalsRecord = {
  _id?: null;
  totalActiveDays?: number;
  totalFreezeUsed?: number;
  longestStreak?: number;
};

export class MongoActivityQueryRepository
  extends MongoActivityBaseRepository
  implements IActivityQueryRepository
{
  constructor(private readonly _mapper = new MongoActivityMapper()) {
    super();
  }

  async findActivityFeed(input: FindActivityFeedInput): Promise<FindActivityFeedResult> {
    return this.execute('ACTIVITY_FEED_READ_FAILED', 'Failed to read activity feed', async () => {
      const userId = this.toObjectId(input.userId);

      const beforeId = input.beforeId !== undefined ? this.toObjectId(input.beforeId) : undefined;

      const records = await UserActivity.find(
        MongoActivityFilterBuilder.feed({
          userId,

          ...(input.categories !== undefined
            ? {
                categories: input.categories,
              }
            : {}),

          ...(input.beforeOccurredAt !== undefined
            ? {
                beforeOccurredAt: input.beforeOccurredAt,
              }
            : {}),

          ...(beforeId !== undefined ? { beforeId } : {}),
        })
      )
        .sort({
          occurredAt: -1,
          _id: -1,
        })
        .limit(input.limit + 1)
        .lean<MongoUserActivityRecord[]>();

      const hasMore = records.length > input.limit;
      const pageRecords = hasMore ? records.slice(0, input.limit) : records;

      return {
        activities: pageRecords.map((record: MongoUserActivityRecord) =>
          this._mapper.toEntityOrThrow(record)
        ),
        hasMore,
      };
    });
  }

  async findActivityAnalytics(input: FindActivityAnalyticsInput): Promise<ActivityAnalyticsRecord> {
    return this.execute(
      'ACTIVITY_ANALYTICS_READ_FAILED',
      'Failed to read activity analytics',
      async () => {
        const userId = this.toObjectId(input.userId);

        const [
          user,
          statistics,
          currentWeekActivityDays,
          currentWeekLeaderboardDays,
          previousWeekLeaderboardXp,
          previousWeekActivityXp,
          currentWeekLeaderboardBreakdown,
          currentWeekActivityBreakdown,
          leaderboardBestDay,
          activityBestDay,
          bestWeek,
          bestTest,
          dailyGoal,
          streak,
        ] = await Promise.all([
          User.findOne({
            _id: userId,
            status: 'active',
            deletedAt: null,
          })
            .select({
              _id: 1,
              fullName: 1,
              avatarUrl: 1,
              isPremium: 1,
              xp: 1,
              teacherXp: 1,
              coins: 1,
              streakCount: 1,
              createdAt: 1,
            })
            .lean<MongoActivityUserRecord>(),

          this.findStatistics(userId),

          this.findDayAggregates(userId, input.currentWeekRange, input.timezone),

          this.findLeaderboardDayXp(userId, input.currentWeekRange, input.timezone),

          this.findLeaderboardRangeXp(userId, input.previousWeekRange),

          this.sumActivityXp(userId, input.previousWeekRange),

          this.findLeaderboardBreakdown(userId, input.currentWeekRange),

          this.findActivityBreakdown(userId, input.currentWeekRange),

          this.findLeaderboardBestDayXp(userId, input.timezone),

          this.findActivityBestDayXp(userId, input.timezone),

          this.findBestWeekSessions(userId, input.timezone),

          this.findBestTestScore(userId),

          this.findDailyGoalState({
            userId: input.userId,
            todayRange: input.todayRange,
          }),

          this.findStreakAnalytics(userId, input),
        ]);

        const previousWeekXp = Math.max(previousWeekLeaderboardXp.xp, previousWeekActivityXp);

        const currentWeekDays = this.mergeDayXp(
          currentWeekActivityDays,
          currentWeekLeaderboardDays
        );

        const currentWeekBreakdown = this.mergeBreakdowns(
          currentWeekActivityBreakdown,
          currentWeekLeaderboardBreakdown.value
        );

        const bestDayXp = Math.max(leaderboardBestDay?.xp ?? 0, activityBestDay?.xp ?? 0);

        const userStreakCount = Math.max(0, user?.streakCount ?? 0);

        const latestStreakIsCurrent =
          streak.latestActivityDate === input.todayKey ||
          streak.latestActivityDate === input.yesterdayKey;

        const resolvedStreak = {
          ...streak,
          currentStreak: latestStreakIsCurrent
            ? Math.max(streak.currentStreak, userStreakCount)
            : 0,
          longestStreak: Math.max(streak.longestStreak, userStreakCount),
        };

        return {
          user: user
            ? {
                userId: this._mapper.toId(user._id),
                fullName: user.fullName,

                avatarUrl: user.avatarUrl,
                isPremium: user.isPremium ?? false,

                accountCreatedAt: user.createdAt,

                learningXp: Math.max(0, user.xp ?? 0),

                teacherXp: Math.max(0, user.teacherXp ?? 0),

                coins: Math.max(0, user.coins ?? 0),

                streakCount: Math.max(0, user.streakCount ?? 0),
              }
            : null,

          statistics: {
            sessions: statistics?.sessions ?? 0,
            subtopicsDone: statistics?.subtopicsDone ?? 0,
            testsAttempted: statistics?.testsAttempted ?? 0,
            totalQuestions: statistics?.totalQuestions ?? 0,
          },

          streak: resolvedStreak,
          currentWeekDays,
          previousWeekXp,
          currentWeekBreakdown,

          personalBests: {
            bestDayXp,
            bestWeekSessions: bestWeek?.sessions ?? 0,
            bestTestScore: bestTest?.score ?? 0,
          },

          dailyGoal,
        };
      }
    );
  }

  async findDailyGoalState(input: FindDailyGoalStateInput): Promise<{
    subtopicCompleted: boolean;
    mockTestCompleted: boolean;
  }> {
    return this.execute(
      'ACTIVITY_DAILY_GOAL_READ_FAILED',
      'Failed to read daily goal progress',
      async () => {
        const userId = this.toObjectId(input.userId);

        const [record] = await UserActivity.aggregate<MongoActivityTypeSetRecord>([
          {
            $match: {
              ...MongoActivityFilterBuilder.activeByUser(userId),

              occurredAt: MongoActivityFilterBuilder.dateRange(input.todayRange),

              type: {
                $in: ['subtopic_completed', 'mock_test_completed'],
              },
            },
          },

          {
            $group: {
              _id: null,
              types: {
                $addToSet: '$type',
              },
            },
          },
        ]);

        const types = new Set(record?.types ?? []);

        return {
          subtopicCompleted: types.has('subtopic_completed'),
          mockTestCompleted: types.has('mock_test_completed'),
        };
      }
    );
  }

  private async findStatistics(
    userId: mongoose.Types.ObjectId
  ): Promise<MongoActivityStatisticsRecord | undefined> {
    const [record] = await UserActivity.aggregate<MongoActivityStatisticsRecord>([
      {
        $match: MongoActivityFilterBuilder.activeByUser(userId),
      },

      {
        $group: {
          _id: null,

          sessions: {
            $sum: {
              $cond: [
                {
                  $in: ['$type', SESSION_TYPES],
                },
                1,
                0,
              ],
            },
          },

          subtopicsDone: {
            $sum: {
              $cond: [
                {
                  $eq: ['$type', 'subtopic_completed'],
                },
                1,
                0,
              ],
            },
          },

          testsAttempted: {
            $sum: {
              $cond: [
                {
                  $eq: ['$type', 'mock_test_completed'],
                },
                1,
                0,
              ],
            },
          },

          totalQuestions: {
            $sum: {
              $cond: [
                {
                  $eq: ['$type', 'mock_test_completed'],
                },
                {
                  $ifNull: ['$details.totalQuestions', 0],
                },
                0,
              ],
            },
          },
        },
      },
    ]);

    return record;
  }

  private async findDayAggregates(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['currentWeekRange'],
    timezone: string
  ): Promise<ActivityDayAggregateRecord[]> {
    const records = await UserActivity.aggregate<MongoActivityDayAggregateRecord>([
      {
        $match: {
          ...MongoActivityFilterBuilder.activeByUser(userId),

          occurredAt: MongoActivityFilterBuilder.dateRange(range),
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$occurredAt',
              timezone,
            },
          },

          activityCount: {
            $sum: 1,
          },

          xp: {
            $sum: '$xpAwarded',
          },

          sessions: {
            $sum: {
              $cond: [
                {
                  $in: ['$type', SESSION_TYPES],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return records.map((record: MongoActivityDayAggregateRecord) => ({
      date: record._id,
      activityCount: record.activityCount ?? 0,
      xp: record.xp ?? 0,
      sessions: record.sessions ?? 0,
    }));
  }

  private async findLeaderboardDayXp(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['currentWeekRange'],
    timezone: string
  ): Promise<LeaderboardDayXpRecord[]> {
    return LeaderboardXpEvent.aggregate<LeaderboardDayXpRecord>([
      {
        $match: {
          userId,
          occurredAt: MongoActivityFilterBuilder.dateRange(range),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$occurredAt',
              timezone,
            },
          },
          xp: {
            $sum: '$amount',
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
  }

  private mergeDayXp(
    activityDays: ActivityDayAggregateRecord[],
    xpDays: LeaderboardDayXpRecord[]
  ): ActivityDayAggregateRecord[] {
    const byDate = new Map(activityDays.map((day) => [day.date, { ...day }]));

    for (const xpDay of xpDays) {
      const current = byDate.get(xpDay._id) ?? {
        date: xpDay._id,
        activityCount: 0,
        xp: 0,
        sessions: 0,
      };

      current.xp = Math.max(0, current.xp, xpDay.xp ?? 0);
      byDate.set(xpDay._id, current);
    }

    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  private async findLeaderboardRangeXp(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['previousWeekRange']
  ): Promise<{
    found: boolean;
    xp: number;
  }> {
    const [record] = await LeaderboardXpEvent.aggregate<LeaderboardRangeXpRecord>([
      {
        $match: {
          userId,
          occurredAt: MongoActivityFilterBuilder.dateRange(range),
        },
      },
      {
        $group: {
          _id: null,
          xp: {
            $sum: '$amount',
          },
          eventCount: {
            $sum: 1,
          },
        },
      },
    ]);

    return {
      found: (record?.eventCount ?? 0) > 0,
      xp: Math.max(0, record?.xp ?? 0),
    };
  }

  private async sumActivityXp(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['previousWeekRange']
  ): Promise<number> {
    const [record] = await UserActivity.aggregate<MongoActivityXpRecord>([
      {
        $match: {
          ...MongoActivityFilterBuilder.activeByUser(userId),

          occurredAt: MongoActivityFilterBuilder.dateRange(range),
        },
      },

      {
        $group: {
          _id: null,
          xp: {
            $sum: '$xpAwarded',
          },
        },
      },
    ]);

    return Math.max(0, record?.xp ?? 0);
  }

  private async findLeaderboardBreakdown(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['currentWeekRange']
  ): Promise<{
    found: boolean;
    value: ActivityWeeklyBreakdownRecord;
  }> {
    const records = await LeaderboardXpEvent.aggregate<LeaderboardBreakdownRecord>([
      {
        $match: {
          userId,
          occurredAt: MongoActivityFilterBuilder.dateRange(range),
        },
      },
      {
        $group: {
          _id: {
            category: '$metadata.activityCategory',
            source: '$source',
          },
          xp: {
            $sum: '$amount',
          },
        },
      },
    ]);

    const totals = this.emptyBreakdown();

    for (const record of records) {
      const category = record._id.category ?? this.categoryForSource(record._id.source ?? '');

      if (!category) {
        continue;
      }

      this.addBreakdownXp(totals, category, Math.max(0, record.xp ?? 0));
    }

    return {
      found: records.length > 0,
      value: totals,
    };
  }

  private async findActivityBreakdown(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['currentWeekRange']
  ): Promise<ActivityWeeklyBreakdownRecord> {
    const records = await UserActivity.aggregate<MongoActivityBreakdownRecord>([
      {
        $match: {
          ...MongoActivityFilterBuilder.activeByUser(userId),

          occurredAt: MongoActivityFilterBuilder.dateRange(range),
        },
      },

      {
        $group: {
          _id: '$category',
          xp: {
            $sum: '$xpAwarded',
          },
        },
      },
    ]);

    const totals = this.emptyBreakdown();

    for (const record of records) {
      this.addBreakdownXp(totals, record._id, Math.max(0, record.xp ?? 0));
    }

    return totals;
  }

  private mergeBreakdowns(
    first: ActivityWeeklyBreakdownRecord,
    second: ActivityWeeklyBreakdownRecord
  ): ActivityWeeklyBreakdownRecord {
    return {
      tracker: Math.max(first.tracker, second.tracker),
      mockTest: Math.max(first.mockTest, second.mockTest),
      community: Math.max(first.community, second.community),
      streak: Math.max(first.streak, second.streak),
      xpMilestone: Math.max(first.xpMilestone, second.xpMilestone),
    };
  }

  private emptyBreakdown(): ActivityWeeklyBreakdownRecord {
    return {
      tracker: 0,
      mockTest: 0,
      community: 0,
      streak: 0,
      xpMilestone: 0,
    };
  }

  private addBreakdownXp(
    totals: ActivityWeeklyBreakdownRecord,
    category: ActivityCategory,
    xp: number
  ): void {
    switch (category) {
      case 'tracker':
        totals.tracker += xp;
        break;
      case 'mock_test':
        totals.mockTest += xp;
        break;
      case 'community':
        totals.community += xp;
        break;
      case 'streak':
        totals.streak += xp;
        break;
      case 'xp_milestone':
        totals.xpMilestone += xp;
        break;
    }
  }

  private categoryForSource(source: string): ActivityCategory | null {
    switch (source) {
      case 'subtopic_completed':
      case 'topic_completed':
      case 'tracker_completed':
        return 'tracker';

      case 'mock_test_generated':
      case 'mock_test_completed':
        return 'mock_test';

      case 'tracker_cloned':
      case 'tracker_verified':
      case 'community_review_completed':
        return 'community';

      case 'streak_milestone':
      case 'daily_goal_completed':
        return 'streak';

      case 'xp_milestone':
        return 'xp_milestone';

      default:
        return null;
    }
  }

  private async findLeaderboardBestDayXp(
    userId: mongoose.Types.ObjectId,
    timezone: string
  ): Promise<MongoActivityBestDayRecord | undefined> {
    const [record] = await LeaderboardXpEvent.aggregate<MongoActivityBestDayRecord>([
      {
        $match: {
          userId,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$occurredAt',
              timezone,
            },
          },
          xp: {
            $sum: '$amount',
          },
        },
      },
      {
        $sort: {
          xp: -1,
          _id: 1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    return record;
  }

  private async findActivityBestDayXp(
    userId: mongoose.Types.ObjectId,
    timezone: string
  ): Promise<MongoActivityBestDayRecord | undefined> {
    const [record] = await UserActivity.aggregate<MongoActivityBestDayRecord>([
      {
        $match: MongoActivityFilterBuilder.activeByUser(userId),
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$occurredAt',
              timezone,
            },
          },
          xp: {
            $sum: '$xpAwarded',
          },
        },
      },
      {
        $sort: {
          xp: -1,
          _id: 1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    return record;
  }

  private async findStreakAnalytics(
    userId: mongoose.Types.ObjectId,
    input: FindActivityAnalyticsInput
  ): Promise<ActivityStreakAnalyticsRecord> {
    const yearStart = new Date(Date.UTC(input.year, 0, 1));
    const yearEnd = new Date(Date.UTC(input.year + 1, 0, 1));

    const [historyDays, latestHistory, latestSnapshot, totals] = await Promise.all([
      StreakHistory.find({
        userId,
        date: {
          $gte: yearStart,
          $lt: yearEnd,
        },
        deletedAt: null,
      })
        .sort({ date: 1 })
        .lean<StreakHistoryLeanRecord[]>(),

      StreakHistory.findOne({
        userId,
        deletedAt: null,
      })
        .sort({ date: -1 })
        .lean<StreakHistoryLeanRecord>(),

      StreakSnapshot.findOne({
        userId,
        deletedAt: null,
      })
        .sort({ snapshotDate: -1 })
        .lean<StreakSnapshotLeanRecord>(),

      this.findStreakTotals(userId),
    ]);

    const hasStoredStreak = Boolean(latestHistory || latestSnapshot);

    /*
     * UserActivity remains a compatibility source for accounts
     * created before streak_history/streak_snapshots were added.
     * This prevents the first new stored streak day from hiding
     * an older longest streak or total-active-day count.
     */
    const legacyActiveDateKeys = await this.findAllActiveDateKeys(userId, input.timezone);

    const legacyStreak = this.calculateStreak(
      legacyActiveDateKeys,
      input.todayKey,
      input.yesterdayKey
    );

    const storedLatestActivityDate = latestHistory
      ? this.toDateKey(latestHistory.date)
      : latestSnapshot
        ? this.toDateKey(latestSnapshot.snapshotDate)
        : null;

    const legacyLatestActivityDate =
      legacyActiveDateKeys.length > 0
        ? (legacyActiveDateKeys[legacyActiveDateKeys.length - 1] ?? null)
        : null;

    const activityDates = [storedLatestActivityDate, legacyLatestActivityDate]
      .filter((value): value is string => Boolean(value))
      .sort();

    const latestActivityDate =
      activityDates.length > 0 ? (activityDates[activityDates.length - 1] ?? null) : null;

    const currentIsActive =
      latestActivityDate === input.todayKey || latestActivityDate === input.yesterdayKey;

    const storedCurrent = Math.max(
      0,
      latestHistory?.streakDay ?? latestSnapshot?.currentStreak ?? 0
    );

    const storedLongest = Math.max(
      0,
      latestSnapshot?.longestStreak ?? 0,
      totals?.longestStreak ?? 0,
      storedCurrent
    );

    const legacyYearDays = await this.findLegacyStreakDays(userId, input.yearRange, input.timezone);

    const daysByDate = new Map(legacyYearDays.map((day) => [day.date, day]));

    for (const historyDay of historyDays) {
      const date = this.toDateKey(historyDay.date);
      const legacyDay = daysByDate.get(date);
      const activityCount = Math.max(legacyDay?.activityCount ?? 0, historyDay.activityCount ?? 0);

      daysByDate.set(date, {
        date,
        activityCount,
        intensityLevel: this.heatmapIntensity(activityCount),
        isFrozen: historyDay.isFrozen ?? false,
        streakDay: Math.max(0, historyDay.streakDay ?? legacyDay?.streakDay ?? 0),
      });
    }

    const days = [...daysByDate.values()].sort((a, b) => a.date.localeCompare(b.date));

    return {
      currentStreak: currentIsActive
        ? Math.max(hasStoredStreak ? storedCurrent : 0, legacyStreak.currentStreak)
        : 0,

      longestStreak: Math.max(storedLongest, legacyStreak.longestStreak),

      totalActiveDays: Math.max(
        0,
        latestSnapshot?.totalActiveDays ?? 0,
        totals?.totalActiveDays ?? 0,
        legacyActiveDateKeys.length
      ),

      totalFreezeUsed: Math.max(
        0,
        latestSnapshot?.totalFreezeUsed ?? 0,
        totals?.totalFreezeUsed ?? 0
      ),

      latestActivityDate,
      days,
    };
  }

  private async findStreakTotals(
    userId: mongoose.Types.ObjectId
  ): Promise<StreakTotalsRecord | undefined> {
    const [record] = await StreakHistory.aggregate<StreakTotalsRecord>([
      {
        $match: {
          userId,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          totalActiveDays: {
            $sum: {
              $cond: [
                {
                  $gt: ['$activityCount', 0],
                },
                1,
                0,
              ],
            },
          },
          totalFreezeUsed: {
            $sum: {
              $cond: ['$isFrozen', 1, 0],
            },
          },
          longestStreak: {
            $max: '$streakDay',
          },
        },
      },
    ]);

    return record;
  }

  private async findLegacyStreakDays(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['yearRange'],
    timezone: string
  ) {
    const days = await this.findDayAggregates(userId, range, timezone);

    return days.map((day) => ({
      date: day.date,
      activityCount: day.activityCount,
      intensityLevel: this.heatmapIntensity(day.activityCount),
      isFrozen: false,
      streakDay: 0,
    }));
  }

  private async findAllActiveDateKeys(
    userId: mongoose.Types.ObjectId,
    timezone: string
  ): Promise<string[]> {
    const records = await UserActivity.aggregate<{
      _id: string;
    }>([
      {
        $match: MongoActivityFilterBuilder.activeByUser(userId),
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$occurredAt',
              timezone,
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return records.map((record) => record._id);
  }

  private calculateStreak(
    activeDateKeys: string[],
    todayKey: string,
    yesterdayKey: string
  ): {
    currentStreak: number;
    longestStreak: number;
  } {
    const uniqueSorted = [...new Set(activeDateKeys)].sort();

    if (uniqueSorted.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    let longestStreak = 1;
    let runningStreak = 1;

    for (let index = 1; index < uniqueSorted.length; index += 1) {
      const previous = uniqueSorted[index - 1];
      const current = uniqueSorted[index];

      if (!previous || !current) {
        continue;
      }

      const difference = this.dateKeyToTimestamp(current) - this.dateKeyToTimestamp(previous);

      if (difference === DAY_IN_MS) {
        runningStreak += 1;
        longestStreak = Math.max(longestStreak, runningStreak);
      } else {
        runningStreak = 1;
      }
    }

    const activeSet = new Set(uniqueSorted);
    const currentAnchor = activeSet.has(todayKey)
      ? todayKey
      : activeSet.has(yesterdayKey)
        ? yesterdayKey
        : null;

    if (!currentAnchor) {
      return {
        currentStreak: 0,
        longestStreak,
      };
    }

    let currentStreak = 0;
    let cursor = this.dateKeyToTimestamp(currentAnchor);

    while (activeSet.has(new Date(cursor).toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor -= DAY_IN_MS;
    }

    return {
      currentStreak,
      longestStreak,
    };
  }

  private heatmapIntensity(activityCount: number): ActivityHeatmapIntensity {
    if (activityCount <= 0) {
      return 'none';
    }

    if (activityCount <= 2) {
      return 'low';
    }

    if (activityCount <= 4) {
      return 'medium';
    }

    return 'high';
  }

  private async findBestWeekSessions(
    userId: mongoose.Types.ObjectId,
    timezone: string
  ): Promise<MongoActivityBestWeekRecord | undefined> {
    const [record] = await UserActivity.aggregate<MongoActivityBestWeekRecord>([
      {
        $match: {
          ...MongoActivityFilterBuilder.activeByUser(userId),

          type: {
            $in: SESSION_TYPES,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: '$occurredAt',
              unit: 'week',
              startOfWeek: 'monday',
              timezone,
            },
          },
          sessions: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          sessions: -1,
          _id: 1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    return record;
  }

  private async findBestTestScore(
    userId: mongoose.Types.ObjectId
  ): Promise<MongoActivityBestTestRecord | undefined> {
    const [record] = await UserActivity.aggregate<MongoActivityBestTestRecord>([
      {
        $match: {
          ...MongoActivityFilterBuilder.activeByUser(userId),

          type: 'mock_test_completed',
          'details.scorePercentage': {
            $type: 'number',
          },
        },
      },
      {
        $group: {
          _id: null,
          score: {
            $max: '$details.scorePercentage',
          },
        },
      },
    ]);

    return record;
  }

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private dateKeyToTimestamp(dateKey: string): number {
    return Date.parse(`${dateKey}T00:00:00.000Z`);
  }

  private toObjectId(value: string): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new ActivityDomainError('INVALID_ACTIVITY_OBJECT_ID', 'Activity object ID is invalid');
    }

    return new mongoose.Types.ObjectId(value);
  }
}
