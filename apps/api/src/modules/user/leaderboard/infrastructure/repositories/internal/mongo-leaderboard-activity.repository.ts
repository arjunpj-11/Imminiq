import mongoose from 'mongoose';

import { LeaderboardAudience } from '../../../../../../infrastructure/database/models/leaderboard-audience.model';
import { LeaderboardRankSnapshot } from '../../../../../../infrastructure/database/models/leaderboard-rank-snapshot.model';
import { LeaderboardXpEvent } from '../../../../../../infrastructure/database/models/leaderboard-xp-event.model';
import { User } from '../../../../../../infrastructure/database/models/user.model';
import { LeaderboardDomainError } from '../../../domain/leaderboard-domain.error';
import type {
  CaptureLeaderboardSnapshotInput,
  CaptureLeaderboardSnapshotResult,
  ILeaderboardActivityRepository,
  RecordLeaderboardXpActivityInput,
  RecordLeaderboardXpActivityResult,
  ReplaceLeaderboardFriendsInput,
} from '../../../domain/repositories/leaderboard-activity.repository.interface';
import { MongoLeaderboardBaseRepository } from '../shared/mongo-leaderboard-base.repository';
import { MongoLeaderboardErrorMapper } from '../shared/mongo-leaderboard-error.mapper';
import { MongoLeaderboardFilterBuilder } from '../shared/mongo-leaderboard-filter.builder';
import type {
  MongoLeaderboardXpEventRecord,
  MongoSnapshotCaptureRecord,
} from '../shared/mongo-leaderboard.types';

const SNAPSHOT_WRITE_BATCH_SIZE = 1000;

export class MongoLeaderboardActivityRepository
  extends MongoLeaderboardBaseRepository
  implements ILeaderboardActivityRepository
{
  async recordXpActivity(
    input: RecordLeaderboardXpActivityInput
  ): Promise<RecordLeaderboardXpActivityResult> {
    return this.execute(
      'LEADERBOARD_XP_ACTIVITY_WRITE_FAILED',
      'Failed to record leaderboard XP activity',
      async () => {
        const userId = this.toObjectId(input.userId);

        const userExists = await User.exists({
          _id: userId,
          deletedAt: null,
        });

        if (!userExists) {
          throw new LeaderboardDomainError(
            'LEADERBOARD_USER_NOT_FOUND',
            'Leaderboard user not found'
          );
        }

        let created = false;

        try {
          const writeResult = await LeaderboardXpEvent.updateOne(
            {
              idempotencyKey: input.idempotencyKey,
            },
            {
              $setOnInsert: {
                userId,
                section: input.section,
                amount: input.amount,
                source: input.source,
                idempotencyKey: input.idempotencyKey,
                occurredAt: input.occurredAt,
                ...(input.sourceEntityId !== undefined
                  ? { sourceEntityId: input.sourceEntityId }
                  : {}),
                ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
              },
            },
            {
              upsert: true,
              runValidators: true,
            }
          );

          created = writeResult.upsertedCount === 1;
        } catch (error) {
          if (!this.isDuplicateKeyError(error)) {
            throw error;
          }
        }

        if (created) {
          return {
            created: true,
          };
        }

        const existing = await LeaderboardXpEvent.findOne({
          idempotencyKey: input.idempotencyKey,
        })
          .select({
            userId: 1,
            section: 1,
            amount: 1,
            source: 1,
            idempotencyKey: 1,
            sourceEntityId: 1,
            occurredAt: 1,
          })
          .lean<MongoLeaderboardXpEventRecord>();

        if (!existing || !this.isSameXpActivity(existing, input)) {
          throw new LeaderboardDomainError(
            'XP_ACTIVITY_CONFLICT',
            'The idempotency key is already used by a different XP activity'
          );
        }

        return {
          created: false,
        };
      },
      MongoLeaderboardErrorMapper.mapDuplicateRecordError
    );
  }

  async replaceFriendUserIds(input: ReplaceLeaderboardFriendsInput): Promise<void> {
    return this.execute(
      'LEADERBOARD_AUDIENCE_WRITE_FAILED',
      'Failed to update leaderboard friend audience',
      async () => {
        const userId = this.toObjectId(input.userId);
        const friendUserIds = [
          ...new Map(
            input.friendUserIds
              .filter((friendUserId) => mongoose.Types.ObjectId.isValid(friendUserId))
              .map((friendUserId) => {
                const objectId = new mongoose.Types.ObjectId(friendUserId);
                return [objectId.toString(), objectId] as const;
              })
              .filter(([friendUserId]) => friendUserId !== userId.toString())
          ).values(),
        ];

        await LeaderboardAudience.updateOne(
          {
            userId,
          },
          {
            $set: {
              friendUserIds,
            },
            $setOnInsert: {
              userId,
            },
          },
          {
            upsert: true,
            runValidators: true,
          }
        );
      }
    );
  }

  async captureRankSnapshot(
    input: CaptureLeaderboardSnapshotInput
  ): Promise<CaptureLeaderboardSnapshotResult> {
    return this.execute(
      'LEADERBOARD_SNAPSHOT_WRITE_FAILED',
      'Failed to capture leaderboard rank snapshot',
      async () => {
        const scoreField = MongoLeaderboardFilterBuilder.scoreField(input.section);
        const levelField = MongoLeaderboardFilterBuilder.levelField(input.section);

        const pipeline: mongoose.PipelineStage[] = [
          {
            $match: MongoLeaderboardFilterBuilder.eligibleUser(input.section),
          },
          MongoLeaderboardFilterBuilder.totalRankingKeyStage(input.section),
          {
            $setWindowFields: {
              sortBy: MongoLeaderboardFilterBuilder.rankingWindowSort(),
              output: {
                rank: {
                  $documentNumber: {},
                },
              },
            },
          },
          MongoLeaderboardFilterBuilder.removeRankingKeyStage(),
          {
            $project: {
              _id: 1,
              rank: 1,
              score: `$${scoreField}`,
              level: `$${levelField}`,
              streakCount: 1,
            },
          },
        ];

        const records = await User.aggregate<MongoSnapshotCaptureRecord>(pipeline);

        for (let offset = 0; offset < records.length; offset += SNAPSHOT_WRITE_BATCH_SIZE) {
          const batch = records.slice(offset, offset + SNAPSHOT_WRITE_BATCH_SIZE);

          await LeaderboardRankSnapshot.bulkWrite(
            batch.map((record) => ({
              updateOne: {
                filter: {
                  snapshotKey: input.snapshotKey,
                  section: input.section,
                  userId: record._id,
                },
                update: {
                  $set: {
                    capturedAt: input.capturedAt,
                    score: Math.max(0, record.score),
                    level: Math.max(1, record.level),
                    streakCount: Math.max(0, record.streakCount),
                    rank: record.rank,
                  },
                  $setOnInsert: {
                    snapshotKey: input.snapshotKey,
                    section: input.section,
                    userId: record._id,
                  },
                },
                upsert: true,
              },
            })),
            {
              ordered: false,
            }
          );
        }

        await LeaderboardRankSnapshot.deleteMany({
          snapshotKey: input.snapshotKey,
          section: input.section,
          capturedAt: {
            $ne: input.capturedAt,
          },
        });

        return {
          section: input.section,
          capturedUsers: records.length,
        };
      },
      MongoLeaderboardErrorMapper.mapDuplicateRecordError
    );
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    );
  }

  private isSameXpActivity(
    existing: MongoLeaderboardXpEventRecord,
    input: RecordLeaderboardXpActivityInput
  ): boolean {
    return (
      existing.userId.toString() === input.userId &&
      existing.section === input.section &&
      existing.amount === input.amount &&
      existing.source === input.source &&
      (existing.sourceEntityId ?? undefined) === input.sourceEntityId
    );
  }

  private toObjectId(value: string): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new LeaderboardDomainError(
        'INVALID_LEADERBOARD_USER_ID',
        'Leaderboard user ID is invalid'
      );
    }

    return new mongoose.Types.ObjectId(value);
  }
}
