import mongoose from 'mongoose';

import { LeaderboardAudience } from '../../../../../../infrastructure/database/models/leaderboard-audience.model';
import { LeaderboardRankSnapshot } from '../../../../../../infrastructure/database/models/leaderboard-rank-snapshot.model';
import { LeaderboardXpEvent } from '../../../../../../infrastructure/database/models/leaderboard-xp-event.model';
import { User } from '../../../../../../infrastructure/database/models/user.model';
import { LeaderboardDomainError } from '../../../domain/leaderboard-domain.error';
import type {
  FindLeaderboardInput,
  LeaderboardQueryResult,
} from '../../../domain/repositories/leaderboard-query.repository.interface';
import type {
  LeaderboardScope,
  LeaderboardSection,
  LeaderboardTimeRange,
} from '../../../domain/leaderboard.types';
import { MongoLeaderboardBaseRepository } from '../shared/mongo-leaderboard-base.repository';
import { MongoLeaderboardFilterBuilder } from '../shared/mongo-leaderboard-filter.builder';
import { MongoLeaderboardMapper } from '../shared/mongo-leaderboard.mapper';
import type {
  MongoLeaderboardFacetRecord,
  MongoRankedUserRecord,
  MongoSnapshotRankRecord,
} from '../shared/mongo-leaderboard.types';

type RankingBundle = {
  topEntries: MongoRankedUserRecord[];
  viewerEntry: MongoRankedUserRecord | null;
  participantCount: number;
  targetRankScore: number | null;
};

type SnapshotReference = {
  snapshotKey: string;
  capturedAt: Date;
};

export class MongoLeaderboardQueryRepository extends MongoLeaderboardBaseRepository {
  constructor(private readonly _mapper = new MongoLeaderboardMapper()) {
    super();
  }

  async findLeaderboard(input: FindLeaderboardInput): Promise<LeaderboardQueryResult> {
    return this.execute('LEADERBOARD_READ_FAILED', 'Failed to read leaderboard', async () => {
      const audienceIds = await this.resolveAudienceIds(input.scope, input.viewerUserId);
      console.log(audienceIds);
      const selectedRanking =
        input.scope === 'weekly'
          ? await this.findWeeklyRanking(
              input.section,
              input.viewerUserId,
              input.currentPeriod,
              input.limit,
              input.targetRank
            )
          : await this.findTotalRanking(
              input.section,
              input.viewerUserId,
              input.limit,
              input.targetRank,
              audienceIds
            );
      console.log(selectedRanking);

      const selectedUserIds = this.collectRankingUserIds(selectedRanking);

      const previousSelectedRanks =
        input.scope === 'weekly'
          ? await this.findPreviousWeeklyRanks(input.section, input.previousPeriod, selectedUserIds)
          : await this.findPreviousSnapshotRanks(
              input.section,
              input.scope,
              input.previousSnapshotBefore,
              selectedUserIds,
              audienceIds
            );

      const topEntries = selectedRanking.topEntries.map((record) =>
        this._mapper.toEntryEntity(
          record,
          input.section,
          previousSelectedRanks.get(this._mapper.toId(record._id))
        )
      );

      const viewerEntry = selectedRanking.viewerEntry
        ? this._mapper.toEntryEntity(
            selectedRanking.viewerEntry,
            input.section,
            previousSelectedRanks.get(this._mapper.toId(selectedRanking.viewerEntry._id))
          )
        : null;

      const globalViewerEntry =
        input.scope === 'global'
          ? viewerEntry
          : await this.findGlobalViewerEntry(
              input.section,
              input.viewerUserId,
              input.previousSnapshotBefore
            );

      const [activeStudentCount, activeTrainerCount, streakChampions, weeklyScores] =
        await Promise.all([
          this.countActiveParticipants('students'),
          this.countActiveParticipants('trainers'),
          this.findStreakChampions(
            input.section,
            input.streakChampionLimit,
            input.scope === 'friends' ? audienceIds : undefined
          ),
          this.findViewerWeeklyScores(
            input.viewerUserId,
            input.section,
            input.currentPeriod,
            input.previousPeriod
          ),
        ]);

      return {
        topEntries,
        viewerEntry,
        globalViewerEntry,
        streakChampions,
        selectedParticipantCount: selectedRanking.participantCount,
        activeStudentCount,
        activeTrainerCount,
        targetRankScore: selectedRanking.targetRankScore,
        weeklyScore: weeklyScores.current,
        previousWeeklyScore: weeklyScores.previous,
      };
    });
  }

  private async resolveAudienceIds(
    scope: LeaderboardScope,
    viewerUserId: string
  ): Promise<mongoose.Types.ObjectId[] | undefined> {
    if (scope !== 'friends') {
      return undefined;
    }

    const viewerObjectId = this.toObjectId(viewerUserId);

    const audience = await LeaderboardAudience.findOne({
      userId: viewerObjectId,
    })
      .select({ friendUserIds: 1 })
      .lean<{
        friendUserIds?: mongoose.Types.ObjectId[];
      }>();

    const ids = new Map<string, mongoose.Types.ObjectId>();
    ids.set(viewerObjectId.toString(), viewerObjectId);

    for (const friendUserId of audience?.friendUserIds ?? []) {
      ids.set(friendUserId.toString(), friendUserId);
    }

    return [...ids.values()];
  }

  private async findTotalRanking(
    section: LeaderboardSection,
    viewerUserId: string,
    limit: number,
    targetRank: number,
    audienceIds?: mongoose.Types.ObjectId[]
  ): Promise<RankingBundle> {
    const viewerObjectId = this.toObjectId(viewerUserId);
    const scoreField = MongoLeaderboardFilterBuilder.scoreField(section);
    const levelField = MongoLeaderboardFilterBuilder.levelField(section);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          ...MongoLeaderboardFilterBuilder.eligibleUser(section),
          ...(audienceIds
            ? {
                _id: {
                  $in: audienceIds,
                },
              }
            : {}),
        },
      },
      MongoLeaderboardFilterBuilder.totalRankingKeyStage(section),
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
        $sort: {
          rank: 1,
        },
      },
      {
        $project: {
          _id: 1,
          rank: 1,
          fullName: 1,
          username: 1,
          avatarUrl: 1,
          score: `$${scoreField}`,
          totalScore: `$${scoreField}`,
          level: `$${levelField}`,
          streakCount: 1,
          createdAt: 1,
        },
      },
      {
        $facet: {
          topEntries: [{ $limit: limit }],
          viewerEntries: [
            {
              $match: {
                _id: viewerObjectId,
              },
            },
            { $limit: 1 },
          ],
          targetEntries: [{ $skip: targetRank - 1 }, { $limit: 1 }],
          metadata: [{ $count: 'count' }],
        },
      },
    ];

    const [facet] = await User.aggregate<MongoLeaderboardFacetRecord>(pipeline);

    return this.toRankingBundle(facet);
  }

  private async findWeeklyRanking(
    section: LeaderboardSection,
    viewerUserId: string,
    period: LeaderboardTimeRange,
    limit: number,
    targetRank: number
  ): Promise<RankingBundle> {
    const viewerObjectId = this.toObjectId(viewerUserId);
    const scoreField = MongoLeaderboardFilterBuilder.scoreField(section, 'user.');
    const levelField = MongoLeaderboardFilterBuilder.levelField(section, 'user.');

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          section,
          occurredAt: {
            $gte: period.start,
            $lt: period.end,
          },
        },
      },
      {
        $group: {
          _id: '$userId',
          score: {
            $sum: '$amount',
          },
        },
      },
      {
        $match: {
          score: {
            $gt: 0,
          },
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $match: MongoLeaderboardFilterBuilder.eligibleUser(section, 'user.'),
      },
      {
        $project: {
          _id: 1,
          fullName: '$user.fullName',
          username: '$user.username',
          avatarUrl: '$user.avatarUrl',
          score: 1,
          totalScore: `$${scoreField}`,
          level: `$${levelField}`,
          streakCount: '$user.streakCount',
          createdAt: '$user.createdAt',
        },
      },
      MongoLeaderboardFilterBuilder.weeklyRankingKeyStage(),
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
        $sort: {
          rank: 1,
        },
      },
      {
        $facet: {
          topEntries: [{ $limit: limit }],
          viewerEntries: [
            {
              $match: {
                _id: viewerObjectId,
              },
            },
            { $limit: 1 },
          ],
          targetEntries: [{ $skip: targetRank - 1 }, { $limit: 1 }],
          metadata: [{ $count: 'count' }],
        },
      },
    ];

    const [facet] = await LeaderboardXpEvent.aggregate<MongoLeaderboardFacetRecord>(pipeline);

    return this.toRankingBundle(facet);
  }

  private toRankingBundle(facet?: MongoLeaderboardFacetRecord): RankingBundle {
    return {
      topEntries: facet?.topEntries ?? [],
      viewerEntry: facet?.viewerEntries?.[0] ?? null,
      participantCount: facet?.metadata?.[0]?.count ?? 0,
      targetRankScore: facet?.targetEntries?.[0]?.score ?? null,
    };
  }

  private collectRankingUserIds(ranking: RankingBundle): string[] {
    const ids = new Set(ranking.topEntries.map((record) => this._mapper.toId(record._id)));

    if (ranking.viewerEntry) {
      ids.add(this._mapper.toId(ranking.viewerEntry._id));
    }

    return [...ids];
  }

  private async findPreviousWeeklyRanks(
    section: LeaderboardSection,
    period: LeaderboardTimeRange,
    userIds: string[]
  ): Promise<Map<string, number>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const objectIds = userIds.map((userId) => this.toObjectId(userId));

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          section,
          occurredAt: {
            $gte: period.start,
            $lt: period.end,
          },
        },
      },
      {
        $group: {
          _id: '$userId',
          score: {
            $sum: '$amount',
          },
        },
      },
      {
        $match: {
          score: {
            $gt: 0,
          },
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $match: MongoLeaderboardFilterBuilder.eligibleUser(section, 'user.'),
      },
      {
        $project: {
          _id: 1,
          score: 1,
          createdAt: '$user.createdAt',
        },
      },
      MongoLeaderboardFilterBuilder.weeklyRankingKeyStage(),
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
        $match: {
          _id: {
            $in: objectIds,
          },
        },
      },
      {
        $project: {
          _id: 1,
          rank: 1,
        },
      },
    ];

    const records = await LeaderboardXpEvent.aggregate<{
      _id: mongoose.Types.ObjectId;
      rank: number;
    }>(pipeline);

    return new Map(records.map((record) => [record._id.toString(), record.rank]));
  }

  private async findPreviousSnapshotRanks(
    section: LeaderboardSection,
    scope: LeaderboardScope,
    snapshotBefore: Date,
    userIds: string[],
    audienceIds?: mongoose.Types.ObjectId[]
  ): Promise<Map<string, number>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const reference = await this.findSnapshotReference(section, snapshotBefore);

    if (!reference) {
      return new Map();
    }

    if (scope === 'friends') {
      const snapshots = await LeaderboardRankSnapshot.find({
        section,
        snapshotKey: reference.snapshotKey,
        userId: {
          $in: audienceIds ?? [],
        },
      })
        .sort({
          score: -1,
          // Stored global rank preserves the original createdAt/_id tie order.
          rank: 1,
        })
        .select({
          userId: 1,
          score: 1,
          rank: 1,
        })
        .lean<MongoSnapshotRankRecord[]>();

      const targetIds = new Set(userIds);
      const ranks = new Map<string, number>();

      snapshots.forEach((snapshot, index) => {
        const userId = snapshot.userId.toString();

        if (targetIds.has(userId)) {
          ranks.set(userId, index + 1);
        }
      });

      return ranks;
    }

    const snapshots = await LeaderboardRankSnapshot.find({
      section,
      snapshotKey: reference.snapshotKey,
      userId: {
        $in: userIds.map((userId) => this.toObjectId(userId)),
      },
    })
      .select({
        userId: 1,
        rank: 1,
      })
      .lean<MongoSnapshotRankRecord[]>();

    return new Map(snapshots.map((snapshot) => [snapshot.userId.toString(), snapshot.rank]));
  }

  private async findSnapshotReference(
    section: LeaderboardSection,
    snapshotBefore: Date
  ): Promise<SnapshotReference | null> {
    const snapshotKey = snapshotBefore.toISOString().slice(0, 10);

    const exact = await LeaderboardRankSnapshot.findOne({
      section,
      snapshotKey,
    })
      .sort({ capturedAt: -1 })
      .select({ snapshotKey: 1, capturedAt: 1 })
      .lean<SnapshotReference>();

    if (exact) {
      return exact;
    }

    return LeaderboardRankSnapshot.findOne({
      section,
      capturedAt: {
        $lt: snapshotBefore,
      },
    })
      .sort({ capturedAt: -1 })
      .select({ snapshotKey: 1, capturedAt: 1 })
      .lean<SnapshotReference>();
  }

  private async findGlobalViewerEntry(
    section: LeaderboardSection,
    viewerUserId: string,
    snapshotBefore: Date
  ) {
    const ranking = await this.findTotalRanking(section, viewerUserId, 1, 1);

    if (!ranking.viewerEntry) {
      return null;
    }

    const previousRanks = await this.findPreviousSnapshotRanks(section, 'global', snapshotBefore, [
      viewerUserId,
    ]);

    return this._mapper.toEntryEntity(
      ranking.viewerEntry,
      section,
      previousRanks.get(viewerUserId)
    );
  }

  private async countActiveParticipants(section: LeaderboardSection): Promise<number> {
    return User.countDocuments(MongoLeaderboardFilterBuilder.eligibleUser(section));
  }

  private async findStreakChampions(
    section: LeaderboardSection,
    limit: number,
    audienceIds?: mongoose.Types.ObjectId[]
  ) {
    const scoreField = MongoLeaderboardFilterBuilder.scoreField(section);
    const levelField = MongoLeaderboardFilterBuilder.levelField(section);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          ...MongoLeaderboardFilterBuilder.eligibleUser(section),
          ...(audienceIds
            ? {
                _id: {
                  $in: audienceIds,
                },
              }
            : {}),
          streakCount: {
            $gt: 0,
          },
        },
      },
      {
        $sort: {
          streakCount: -1,
          [scoreField]: -1,
          createdAt: 1,
          _id: 1,
        },
      },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          fullName: 1,
          username: 1,
          avatarUrl: 1,
          score: `$${scoreField}`,
          totalScore: `$${scoreField}`,
          level: `$${levelField}`,
          streakCount: 1,
          createdAt: 1,
        },
      },
    ];

    const records = await User.aggregate<MongoRankedUserRecord>(pipeline);

    return records.map((record, index) =>
      this._mapper.toEntryEntity(
        {
          ...record,
          rank: index + 1,
        },
        section
      )
    );
  }

  private async findViewerWeeklyScores(
    viewerUserId: string,
    section: LeaderboardSection,
    currentPeriod: LeaderboardTimeRange,
    previousPeriod: LeaderboardTimeRange
  ): Promise<{
    current: number;
    previous: number;
  }> {
    const viewerObjectId = this.toObjectId(viewerUserId);

    const [current, previous] = await Promise.all([
      this.sumXpEvents(viewerObjectId, section, currentPeriod),
      this.sumXpEvents(viewerObjectId, section, previousPeriod),
    ]);

    return {
      current,
      previous,
    };
  }

  private async sumXpEvents(
    userId: mongoose.Types.ObjectId,
    section: LeaderboardSection,
    period: LeaderboardTimeRange
  ): Promise<number> {
    const [record] = await LeaderboardXpEvent.aggregate<{
      score: number;
    }>([
      {
        $match: {
          userId,
          section,
          occurredAt: {
            $gte: period.start,
            $lt: period.end,
          },
        },
      },
      {
        $group: {
          _id: null,
          score: {
            $sum: '$amount',
          },
        },
      },
      {
        $project: {
          _id: 0,
          score: 1,
        },
      },
    ]);

    return Math.max(0, record?.score ?? 0);
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
