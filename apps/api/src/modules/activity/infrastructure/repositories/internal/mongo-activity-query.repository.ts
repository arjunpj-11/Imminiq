import mongoose from 'mongoose'

import { UserActivity } from '../../../../../infrastructure/database/models/user-activity.model'
import { User } from '../../../../../infrastructure/database/models/user.model'
import { ActivityDomainError } from '../../../domain/errors/activity-domain.error'
import type {
  ActivityQueryRepositoryContract,
  FindActivityAnalyticsInput,
  FindActivityFeedInput,
  FindActivityFeedResult,
  FindDailyGoalStateInput,
} from '../../../domain/repositories/activity-query.repository.interface'
import type {
  ActivityAnalyticsRecord,
  ActivityDayAggregateRecord,
  ActivityWeeklyBreakdownRecord,
} from '../../../domain/types/activity.types'
import {
  ACTIVITY_SESSION_TYPES,
} from '../../../domain/constants/activity.constants'
import { MongoActivityBaseRepository } from '../shared/mongo-activity-base.repository'
import { MongoActivityFilterBuilder } from '../shared/mongo-activity-filter.builder'
import { MongoActivityMapper } from '../shared/mongo-activity.mapper'
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
} from '../shared/mongo-activity.types'

const SESSION_TYPES = [...ACTIVITY_SESSION_TYPES]

export class MongoActivityQueryRepository
  extends MongoActivityBaseRepository
  implements ActivityQueryRepositoryContract
{
  constructor(
    private readonly _mapper = new MongoActivityMapper(),
  ) {
    super()
  }

  async findActivityFeed(
    input: FindActivityFeedInput,
  ): Promise<FindActivityFeedResult> {
    return this.execute(
      'ACTIVITY_FEED_READ_FAILED',
      'Failed to read activity feed',
      async () => {
        const userId = this.toObjectId(input.userId)

        const beforeId =
          input.beforeId !== undefined
            ? this.toObjectId(input.beforeId)
            : undefined

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
                  beforeOccurredAt:
                    input.beforeOccurredAt,
                }
              : {}),

            ...(beforeId !== undefined
              ? { beforeId }
              : {}),
          }),
        )
          .sort({
            occurredAt: -1,
            _id: -1,
          })
          .limit(input.limit + 1)
          .lean<MongoUserActivityRecord[]>()

        const hasMore = records.length > input.limit
        const pageRecords = hasMore
          ? records.slice(0, input.limit)
          : records

        return {
          activities: pageRecords.map((record: MongoUserActivityRecord) =>
            this._mapper.toEntityOrThrow(record),
          ),
          hasMore,
        }
      },
    )
  }

  async findActivityAnalytics(
    input: FindActivityAnalyticsInput,
  ): Promise<ActivityAnalyticsRecord> {
    return this.execute(
      'ACTIVITY_ANALYTICS_READ_FAILED',
      'Failed to read activity analytics',
      async () => {
        const userId = this.toObjectId(input.userId)

        const [
          user,
          statistics,
          yearDays,
          activeDays,
          currentWeekDays,
          previousWeekXp,
          currentWeekBreakdown,
          bestDay,
          bestWeek,
          bestTest,
          dailyGoal,
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
              createdAt: 1,
            })
            .lean<MongoActivityUserRecord>(),

          this.findStatistics(userId),

          this.findDayAggregates(
            userId,
            input.yearRange,
            input.timezone,
          ),

          this.findAllActiveDateKeys(
            userId,
            input.timezone,
          ),

          this.findDayAggregates(
            userId,
            input.currentWeekRange,
            input.timezone,
          ),

          this.sumXp(
            userId,
            input.previousWeekRange,
          ),

          this.findCurrentWeekBreakdown(
            userId,
            input.currentWeekRange,
          ),

          this.findBestDayXp(
            userId,
            input.timezone,
          ),

          this.findBestWeekSessions(
            userId,
            input.timezone,
          ),

          this.findBestTestScore(userId),

          this.findDailyGoalState({
            userId: input.userId,
            todayRange: input.todayRange,
          }),
        ])

        return {
          user: user
            ? {
                userId:
                  this._mapper.toId(user._id),
                fullName: user.fullName,

                avatarUrl: user.avatarUrl,
                isPremium:
                  user.isPremium ?? false,

                accountCreatedAt:
                  user.createdAt,

                learningXp: Math.max(
                  0,
                  user.xp ?? 0,
                ),

                teacherXp: Math.max(
                  0,
                  user.teacherXp ?? 0,
                ),

                coins: Math.max(
                  0,
                  user.coins ?? 0,
                ),
              }
            : null,

          statistics: {
            sessions:
              statistics?.sessions ?? 0,
            subtopicsDone:
              statistics?.subtopicsDone ?? 0,
            testsAttempted:
              statistics?.testsAttempted ?? 0,
            totalQuestions:
              statistics?.totalQuestions ?? 0,
          },

          yearDays,
          activeDateKeys: activeDays.map(
            (day) => day.date,
          ),

          currentWeekDays,
          previousWeekXp,

          currentWeekBreakdown,

          personalBests: {
            bestDayXp: bestDay?.xp ?? 0,
            bestWeekSessions:
              bestWeek?.sessions ?? 0,
            bestTestScore:
              bestTest?.score ?? 0,
          },

          dailyGoal,
        }
      },
    )
  }

  async findDailyGoalState(
    input: FindDailyGoalStateInput,
  ): Promise<{
    subtopicCompleted: boolean
    mockTestCompleted: boolean
  }> {
    return this.execute(
      'ACTIVITY_DAILY_GOAL_READ_FAILED',
      'Failed to read daily goal progress',
      async () => {
        const userId = this.toObjectId(input.userId)

        const [record] =
          await UserActivity.aggregate<
            MongoActivityTypeSetRecord
          >([
            {
              $match: {
                ...MongoActivityFilterBuilder.activeByUser(
                  userId,
                ),

                occurredAt:
                  MongoActivityFilterBuilder.dateRange(
                    input.todayRange,
                  ),

                type: {
                  $in: [
                    'subtopic_completed',
                    'mock_test_completed',
                  ],
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
          ])

        const types = new Set(record?.types ?? [])

        return {
          subtopicCompleted:
            types.has('subtopic_completed'),
          mockTestCompleted:
            types.has('mock_test_completed'),
        }
      },
    )
  }

  private async findStatistics(
    userId: mongoose.Types.ObjectId,
  ): Promise<
    MongoActivityStatisticsRecord | undefined
  > {
    const [record] =
      await UserActivity.aggregate<
        MongoActivityStatisticsRecord
      >([
        {
          $match:
            MongoActivityFilterBuilder.activeByUser(
              userId,
            ),
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
                    $eq: [
                      '$type',
                      'subtopic_completed',
                    ],
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
                    $eq: [
                      '$type',
                      'mock_test_completed',
                    ],
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
                    $eq: [
                      '$type',
                      'mock_test_completed',
                    ],
                  },
                  {
                    $ifNull: [
                      '$details.totalQuestions',
                      0,
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
      ])

    return record
  }

  private async findDayAggregates(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['yearRange'],
    timezone: string,
  ): Promise<ActivityDayAggregateRecord[]> {
    const records =
      await UserActivity.aggregate<
        MongoActivityDayAggregateRecord
      >([
        {
          $match: {
            ...MongoActivityFilterBuilder.activeByUser(
              userId,
            ),

            occurredAt:
              MongoActivityFilterBuilder.dateRange(
                range,
              ),
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
      ])

    return records.map((record: MongoActivityDayAggregateRecord) => ({
      date: record._id,
      activityCount:
        record.activityCount ?? 0,
      xp: record.xp ?? 0,
      sessions: record.sessions ?? 0,
    }))
  }

  private async findAllActiveDateKeys(
    userId: mongoose.Types.ObjectId,
    timezone: string,
  ): Promise<
    Array<{
      date: string
    }>
  > {
    const records =
      await UserActivity.aggregate<{
        _id: string
      }>([
        {
          $match:
            MongoActivityFilterBuilder.activeByUser(
              userId,
            ),
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
      ])

    return records.map((record: { _id: string }) => ({
      date: record._id,
    }))
  }

  private async sumXp(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['previousWeekRange'],
  ): Promise<number> {
    const [record] =
      await UserActivity.aggregate<
        MongoActivityXpRecord
      >([
        {
          $match: {
            ...MongoActivityFilterBuilder.activeByUser(
              userId,
            ),

            occurredAt:
              MongoActivityFilterBuilder.dateRange(
                range,
              ),
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
      ])

    return Math.max(0, record?.xp ?? 0)
  }

  private async findCurrentWeekBreakdown(
    userId: mongoose.Types.ObjectId,
    range: FindActivityAnalyticsInput['currentWeekRange'],
  ): Promise<ActivityWeeklyBreakdownRecord> {
    const records =
      await UserActivity.aggregate<
        MongoActivityBreakdownRecord
      >([
        {
          $match: {
            ...MongoActivityFilterBuilder.activeByUser(
              userId,
            ),

            occurredAt:
              MongoActivityFilterBuilder.dateRange(
                range,
              ),
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
      ])

    const totals: ActivityWeeklyBreakdownRecord = {
      tracker: 0,
      mockTest: 0,
      community: 0,
      streak: 0,
      xpMilestone: 0,
    }

    for (const record of records) {
      const xp = Math.max(0, record.xp ?? 0)

      switch (record._id) {
        case 'tracker':
          totals.tracker = xp
          break
        case 'mock_test':
          totals.mockTest = xp
          break
        case 'community':
          totals.community = xp
          break
        case 'streak':
          totals.streak = xp
          break
        case 'xp_milestone':
          totals.xpMilestone = xp
          break
      }
    }

    return totals
  }

  private async findBestDayXp(
    userId: mongoose.Types.ObjectId,
    timezone: string,
  ): Promise<
    MongoActivityBestDayRecord | undefined
  > {
    const [record] =
      await UserActivity.aggregate<
        MongoActivityBestDayRecord
      >([
        {
          $match:
            MongoActivityFilterBuilder.activeByUser(
              userId,
            ),
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
      ])

    return record
  }

  private async findBestWeekSessions(
    userId: mongoose.Types.ObjectId,
    timezone: string,
  ): Promise<
    MongoActivityBestWeekRecord | undefined
  > {
    const [record] =
      await UserActivity.aggregate<
        MongoActivityBestWeekRecord
      >([
        {
          $match: {
            ...MongoActivityFilterBuilder.activeByUser(
              userId,
            ),

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
      ])

    return record
  }

  private async findBestTestScore(
    userId: mongoose.Types.ObjectId,
  ): Promise<
    MongoActivityBestTestRecord | undefined
  > {
    const [record] =
      await UserActivity.aggregate<
        MongoActivityBestTestRecord
      >([
        {
          $match: {
            ...MongoActivityFilterBuilder.activeByUser(
              userId,
            ),

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
      ])

    return record
  }

  private toObjectId(
    value: string,
  ): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new ActivityDomainError(
        'INVALID_ACTIVITY_OBJECT_ID',
        'Activity object ID is invalid',
      )
    }

    return new mongoose.Types.ObjectId(value)
  }
}
