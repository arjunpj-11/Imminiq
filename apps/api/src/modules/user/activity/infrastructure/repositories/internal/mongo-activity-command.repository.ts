import mongoose, { type ClientSession } from 'mongoose';

import { LeaderboardXpEvent } from '../../../../../../infrastructure/database/models/leaderboard-xp-event.model';
import { StreakHistory } from '../../../../../../infrastructure/database/models/streak-history.model';
import { StreakSnapshot } from '../../../../../../infrastructure/database/models/streak-snapshot.model';
import { UserActivity } from '../../../../../../infrastructure/database/models/user-activity.model';
import { User } from '../../../../../../infrastructure/database/models/user.model';
import { ActivityDomainError } from '../../../domain/activity-domain.error';
import type {
  IActivityCommandRepository,
  RecordUserActivityInput,
  RecordUserActivityResult,
} from '../../../domain/repositories/activity-command.repository.interface';
import type { ActivityProgressionChange } from '../../../domain/activity.types';
import type { ActivityHeatmapIntensity } from '../../../domain/value-objects/activity-heatmap-intensity.vo';
import { MongoActivityBaseRepository } from '../shared/mongo-activity-base.repository';
import { MongoActivityErrorMapper } from '../shared/mongo-activity-error.mapper';
import { MongoActivityFilterBuilder } from '../shared/mongo-activity-filter.builder';
import { MongoActivityMapper } from '../shared/mongo-activity.mapper';
import type { MongoUserActivityRecord } from '../shared/mongo-activity.types';

const DAY_IN_MS = 86_400_000;

export class MongoActivityCommandRepository
  extends MongoActivityBaseRepository
  implements IActivityCommandRepository
{
  constructor(private readonly _mapper = new MongoActivityMapper()) {
    super();
  }

  async recordActivityAndApplyReward(
    input: RecordUserActivityInput
  ): Promise<RecordUserActivityResult> {
    return this.execute('ACTIVITY_WRITE_FAILED', 'Failed to record user activity', async () => {
      const userId = this.toObjectId(input.userId);
      const session = await mongoose.startSession();

      try {
        let result: RecordUserActivityResult | undefined;

        await session.withTransaction(async () => {
          const existing = await UserActivity.findOne({
            userId,
            eventKey: input.eventKey,
          })
            .session(session)
            .lean<MongoUserActivityRecord>();

          if (existing) {
            this.ensureSameEvent(existing, input);

            const activity = this._mapper.toEntityOrThrow(existing);

            await this.ensureLeaderboardXpEvent(
              {
                activityId: activity.id,
                input,
              },
              session
            );

            result = {
              activity,
              created: false,
            };

            return;
          }

          const user = await User.findOne({
            _id: userId,
            status: 'active',
            deletedAt: null,
          }).session(session);

          if (!user) {
            throw new ActivityDomainError('ACTIVITY_USER_NOT_FOUND', 'Activity user not found');
          }

          const progressionBefore = {
            learningXp: Math.max(0, user.xp ?? 0),
            learningLevel: Math.max(1, user.level ?? 1),
            teacherXp: Math.max(0, user.teacherXp ?? 0),
            teacherLevel: Math.max(1, user.teacherLevel ?? 1),
            coins: Math.max(0, user.coins ?? 0),
          };

          if (input.xpBucket === 'learning') {
            user.xp = progressionBefore.learningXp + input.xpAwarded;
          }

          if (input.xpBucket === 'teacher') {
            user.teacherXp = progressionBefore.teacherXp + input.xpAwarded;
          }

          if (input.coinsAwarded > 0) {
            user.coins = progressionBefore.coins + input.coinsAwarded;
          }

          if (!user.lastActiveAt || input.occurredAt.getTime() > user.lastActiveAt.getTime()) {
            user.lastActiveAt = input.occurredAt;
          }

          const [createdDocument] = await UserActivity.create(
            [
              {
                userId,

                category: input.category,
                type: input.type,

                title: input.title,
                subtitle: input.subtitle,

                xpAwarded: input.xpAwarded,
                xpBucket: input.xpBucket,
                coinsAwarded: input.coinsAwarded,

                eventKey: input.eventKey,

                trackerId: this.toNullableObjectId(input.trackerId),

                topicId: this.toNullableObjectId(input.topicId),

                subtopicId: this.toNullableObjectId(input.subtopicId),

                mockTestId: this.toNullableObjectId(input.mockTestId),

                attemptId: this.toNullableObjectId(input.attemptId),

                sourceUserId: this.toNullableObjectId(input.sourceUserId),

                details: input.details,
                occurredAt: input.occurredAt,
                deletedAt: null,
              },
            ],
            {
              session,
            }
          );

          if (!createdDocument) {
            throw new ActivityDomainError(
              'ACTIVITY_CREATE_FAILED',
              'Failed to create user activity'
            );
          }

          const activity = this._mapper.toEntityOrThrow(
            this._mapper.toPlainRecord<MongoUserActivityRecord>(createdDocument)
          );

          const streakDay = await this.recordStreakActivity(
            {
              userId,
              activityDateKey: input.activityDateKey,
              activityType: input.type,
              activityDayRange: input.activityDayRange,
              previousDayRange: input.previousDayRange,
              fallbackCurrentStreak: Math.max(0, user.streakCount ?? 0),
            },
            session
          );

          const latestHistory = await StreakHistory.findOne({
            userId,
            deletedAt: null,
          })
            .sort({ date: -1 })
            .session(session);

          if (latestHistory && this.toDateKey(latestHistory.date) === input.activityDateKey) {
            user.streakCount = Math.max(0, streakDay);
          }

          /*
           * save() intentionally executes the User model's XP
           * progression middleware, keeping both level fields
           * synchronized with xp and teacherXp.
           */
          await user.save({ session });

          await this.ensureLeaderboardXpEvent(
            {
              activityId: activity.id,
              input,
            },
            session
          );

          const progression: ActivityProgressionChange = {
            previousLearningXp: progressionBefore.learningXp,
            currentLearningXp: Math.max(0, user.xp ?? 0),

            previousLearningLevel: progressionBefore.learningLevel,
            currentLearningLevel: Math.max(1, user.level ?? 1),

            previousTeacherXp: progressionBefore.teacherXp,
            currentTeacherXp: Math.max(0, user.teacherXp ?? 0),

            previousTeacherLevel: progressionBefore.teacherLevel,
            currentTeacherLevel: Math.max(1, user.teacherLevel ?? 1),

            previousCoins: progressionBefore.coins,
            currentCoins: Math.max(0, user.coins ?? 0),
          };

          result = {
            activity,
            created: true,
            progression,
          };
        });

        if (!result) {
          throw new ActivityDomainError(
            'ACTIVITY_TRANSACTION_FAILED',
            'Activity transaction did not produce a result'
          );
        }

        return result;
      } catch (error) {
        if (!MongoActivityErrorMapper.isDuplicateKeyError(error)) {
          throw error;
        }

        /*
         * A concurrent request may win the unique event-key
         * insert. Its transaction succeeds and this transaction
         * is rolled back, including all reward/streak changes.
         */
        const existing = await UserActivity.findOne({
          userId,
          eventKey: input.eventKey,
        }).lean<MongoUserActivityRecord>();

        if (!existing) {
          throw error;
        }

        this.ensureSameEvent(existing, input);

        const activity = this._mapper.toEntityOrThrow(existing);

        if (input.xpAwarded > 0 && input.xpBucket !== 'none') {
          await LeaderboardXpEvent.updateOne(
            {
              idempotencyKey: `activity-xp:${activity.id}`,
            },
            {
              $setOnInsert: this.leaderboardXpEventInsert(activity.id, input),
            },
            {
              upsert: true,
            }
          );
        }

        return {
          activity,
          created: false,
        };
      } finally {
        await session.endSession();
      }
    });
  }

  private async recordStreakActivity(
    input: {
      userId: mongoose.Types.ObjectId;
      activityDateKey: string;
      activityType: string;
      activityDayRange: {
        start: Date;
        end: Date;
      };
      previousDayRange: {
        start: Date;
        end: Date;
      };
      fallbackCurrentStreak: number;
    },
    session: ClientSession
  ): Promise<number> {
    const historyDate = this.dateKeyToDate(input.activityDateKey);

    let history = await StreakHistory.findOne({
      userId: input.userId,
      date: historyDate,
    }).session(session);

    let isNewActiveDay = false;

    if (!history || history.deletedAt) {
      const previousDate = new Date(historyDate.getTime() - DAY_IN_MS);

      const previousHistory = await StreakHistory.findOne({
        userId: input.userId,
        date: previousDate,
        deletedAt: null,
      }).session(session);

      const currentDayActivities = await UserActivity.find({
        ...MongoActivityFilterBuilder.activeByUser(input.userId),
        occurredAt: MongoActivityFilterBuilder.dateRange(input.activityDayRange),
      })
        .select({ _id: 1 })
        .limit(2)
        .session(session)
        .lean<Array<{ _id: unknown }>>();

      const hadLegacyCurrentDayActivity = currentDayActivities.length > 1;

      let previousStreakDay = previousHistory ? Math.max(1, previousHistory.streakDay ?? 1) : 0;

      if (!previousHistory) {
        const legacyPreviousDayActivity = await UserActivity.exists({
          ...MongoActivityFilterBuilder.activeByUser(input.userId),
          occurredAt: MongoActivityFilterBuilder.dateRange(input.previousDayRange),
        }).session(session);

        if (legacyPreviousDayActivity) {
          previousStreakDay = Math.max(1, input.fallbackCurrentStreak);
        }
      }

      const streakDay =
        hadLegacyCurrentDayActivity && input.fallbackCurrentStreak > 0
          ? input.fallbackCurrentStreak
          : previousStreakDay > 0
            ? previousStreakDay + 1
            : 1;

      if (history) {
        history.activityCount = 1;
        history.intensityLevel = 'low';
        history.sources = [input.activityType];
        history.streakDay = streakDay;
        history.isFrozen = false;
        history.freezeUsedId = null;
        history.deletedAt = null;
        await history.save({ session });
      } else {
        const [createdHistory] = await StreakHistory.create(
          [
            {
              userId: input.userId,
              date: historyDate,
              activityCount: 1,
              intensityLevel: 'low',
              sources: [input.activityType],
              streakDay,
              isFrozen: false,
              freezeUsedId: null,
              deletedAt: null,
            },
          ],
          { session }
        );

        if (!createdHistory) {
          throw new ActivityDomainError(
            'ACTIVITY_STREAK_HISTORY_CREATE_FAILED',
            'Failed to create streak history'
          );
        }

        history = createdHistory;
      }

      isNewActiveDay = true;
    } else {
      history.activityCount = Math.max(0, history.activityCount ?? 0) + 1;
      history.intensityLevel = this.heatmapIntensity(history.activityCount);
      history.sources = [...new Set([...(history.sources ?? []), input.activityType])];
      await history.save({ session });
    }

    const streakDay = Math.max(1, history.streakDay ?? 1);

    await this.upsertStreakSnapshot(
      {
        userId: input.userId,
        snapshotDate: historyDate,
        activityDateKey: input.activityDateKey,
        activityCount: Math.max(0, history.activityCount ?? 0),
        intensityLevel: history.intensityLevel,
        isFrozen: history.isFrozen ?? false,
        streakDay,
        isNewActiveDay,
        fallbackLongestStreak: input.fallbackCurrentStreak,
      },
      session
    );

    return streakDay;
  }

  private async upsertStreakSnapshot(
    input: {
      userId: mongoose.Types.ObjectId;
      snapshotDate: Date;
      activityDateKey: string;
      activityCount: number;
      intensityLevel: ActivityHeatmapIntensity;
      isFrozen: boolean;
      streakDay: number;
      isNewActiveDay: boolean;
      fallbackLongestStreak: number;
    },
    session: ClientSession
  ): Promise<void> {
    const snapshot = await StreakSnapshot.findOne({
      userId: input.userId,
      snapshotDate: input.snapshotDate,
    }).session(session);

    const previousSnapshot = snapshot
      ? null
      : await StreakSnapshot.findOne({
          userId: input.userId,
          snapshotDate: {
            $lt: input.snapshotDate,
          },
          deletedAt: null,
        })
          .sort({ snapshotDate: -1 })
          .session(session);

    const previousLongest = Math.max(
      0,
      snapshot?.longestStreak ?? previousSnapshot?.longestStreak ?? 0,
      input.fallbackLongestStreak
    );

    const previousTotalActiveDays = Math.max(
      0,
      snapshot?.totalActiveDays ?? previousSnapshot?.totalActiveDays ?? 0
    );

    const previousTotalFreezeUsed = Math.max(
      0,
      snapshot?.totalFreezeUsed ?? previousSnapshot?.totalFreezeUsed ?? 0
    );

    const snapshotWasActive = Boolean(snapshot && !snapshot.deletedAt);

    const snapshotValues = {
      currentStreak: input.streakDay,
      longestStreak: Math.max(previousLongest, input.streakDay),
      totalActiveDays:
        previousTotalActiveDays + (!snapshotWasActive && input.isNewActiveDay ? 1 : 0),
      totalFreezeUsed: previousTotalFreezeUsed,
      heatmapData: {
        [input.activityDateKey]: {
          activityCount: input.activityCount,
          intensityLevel: input.intensityLevel,
          isFrozen: input.isFrozen,
        },
      },
      deletedAt: null,
    };

    if (snapshot) {
      snapshot.set(snapshotValues);
      await snapshot.save({ session });
      return;
    }

    const [createdSnapshot] = await StreakSnapshot.create(
      [
        {
          userId: input.userId,
          snapshotDate: input.snapshotDate,
          ...snapshotValues,
        },
      ],
      { session }
    );

    if (!createdSnapshot) {
      throw new ActivityDomainError(
        'ACTIVITY_STREAK_SNAPSHOT_CREATE_FAILED',
        'Failed to create streak snapshot'
      );
    }
  }

  private async ensureLeaderboardXpEvent(
    input: {
      activityId: string;
      input: RecordUserActivityInput;
    },
    session: ClientSession
  ): Promise<void> {
    if (input.input.xpAwarded <= 0 || input.input.xpBucket === 'none') {
      return;
    }

    await LeaderboardXpEvent.updateOne(
      {
        idempotencyKey: `activity-xp:${input.activityId}`,
      },
      {
        $setOnInsert: this.leaderboardXpEventInsert(input.activityId, input.input),
      },
      {
        upsert: true,
        session,
      }
    );
  }

  private leaderboardXpEventInsert(activityId: string, input: RecordUserActivityInput) {
    return {
      userId: this.toObjectId(input.userId),
      section: input.xpBucket === 'learning' ? 'students' : 'trainers',
      amount: input.xpAwarded,
      source: input.type,
      idempotencyKey: `activity-xp:${activityId}`,
      sourceEntityId: activityId,
      occurredAt: input.occurredAt,
      metadata: {
        activityEventKey: input.eventKey,
        activityType: input.type,
        activityCategory: input.category,
        xpBucket: input.xpBucket,
      },
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

  private ensureSameEvent(existing: MongoUserActivityRecord, input: RecordUserActivityInput): void {
    const isSame =
      existing.userId.toString() === input.userId &&
      existing.category === input.category &&
      existing.type === input.type &&
      (existing.xpAwarded ?? 0) === input.xpAwarded &&
      (existing.xpBucket ?? 'none') === input.xpBucket &&
      (existing.coinsAwarded ?? 0) === input.coinsAwarded &&
      this.sameOptionalId(existing.trackerId, input.trackerId) &&
      this.sameOptionalId(existing.topicId, input.topicId) &&
      this.sameOptionalId(existing.subtopicId, input.subtopicId) &&
      this.sameOptionalId(existing.mockTestId, input.mockTestId) &&
      this.sameOptionalId(existing.attemptId, input.attemptId) &&
      this.sameOptionalId(existing.sourceUserId, input.sourceUserId);

    if (!isSame) {
      throw new ActivityDomainError(
        'ACTIVITY_EVENT_CONFLICT',
        'The activity event key is already used by a different event'
      );
    }
  }

  private sameOptionalId(
    existing:
      | {
          toString(): string;
        }
      | null
      | undefined,
    incoming?: string
  ): boolean {
    return (existing?.toString() ?? undefined) === incoming;
  }

  private toNullableObjectId(value?: string): mongoose.Types.ObjectId | null {
    if (value === undefined) {
      return null;
    }

    return this.toObjectId(value);
  }

  private dateKeyToDate(dateKey: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      throw new ActivityDomainError('INVALID_ACTIVITY_DATE_KEY', 'Activity date key is invalid');
    }

    const date = new Date(`${dateKey}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime()) || this.toDateKey(date) !== dateKey) {
      throw new ActivityDomainError('INVALID_ACTIVITY_DATE_KEY', 'Activity date key is invalid');
    }

    return date;
  }

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private toObjectId(value: string): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new ActivityDomainError('INVALID_ACTIVITY_OBJECT_ID', 'Activity object ID is invalid');
    }

    return new mongoose.Types.ObjectId(value);
  }
}
