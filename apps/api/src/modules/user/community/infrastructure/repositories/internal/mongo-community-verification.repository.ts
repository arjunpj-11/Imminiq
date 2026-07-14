import { COMMUNITY_REVIEW_REWARD_COINS } from '../../../domain/community.constants';
import { CommunityDomainError } from '../../../domain/community-domain.error';
import type {
  CreateCommunityReviewVoteInput,
  FindVerificationQueueQuery,
  SubmitTrackerForVerificationInput,
} from '../../../domain/repositories/community-verification.repository.interface';
import type { VerificationVoteChoice } from '../../../domain/community.types';
import { MongoCommunityBaseRepository } from '../shared/mongo-community-base.repository';
import { MongoCommunityErrorMapper } from '../shared/mongo-community-error.mapper';
import { MongoCommunityMapper } from '../shared/mongo-community.mapper';
import {
  CommunityReviewVoteModel,
  CommunityTrackerModel,
  CommunityTrackerSubtopicModel,
  CommunityTrackerTopicModel,
  CommunityUserModel,
  CommunityUserProfileModel,
  CommunityVerificationSubmissionModel,
} from '../shared/mongo-community.models';
import { MongoCommunityNormalizer } from '../shared/mongo-community-normalizer';
import { MongoCommunityObjectId } from '../shared/mongo-community-object-id';
import { MongoCommunityQueryUtils } from '../shared/mongo-community-query.utils';
import type {
  MongoCommunityLeaderboardAggregate,
  MongoCommunitySubmissionRecord,
  MongoCommunityTrackerRecord,
  MongoCommunityVoteRecord,
  MongoTrackerSubtopicRecord,
  MongoTrackerTopicRecord,
  MongoUserProfileRecord,
  MongoUserRecord,
  MongoVerificationReviewTrackerRecord,
} from '../shared/mongo-community.types';

type SubmissionQuery = Record<string, unknown>;

export class MongoCommunityVerificationRepository extends MongoCommunityBaseRepository {
  constructor(
    private readonly _mapper = new MongoCommunityMapper(),
    private readonly _errorMapper = new MongoCommunityErrorMapper()
  ) {
    super();
  }

  async submitTrackerForVerification(data: SubmitTrackerForVerificationInput) {
    return this.execute(
      'COMMUNITY_VERIFICATION_SUBMIT_FAILED',
      'Failed to submit tracker for verification',
      async () => {
        await this.expireDueOpenSubmissions();

        if (
          !MongoCommunityObjectId.isValid(data.trackerId) ||
          !MongoCommunityObjectId.isValid(data.userId)
        ) {
          return null;
        }

        const trackerObjectId = MongoCommunityObjectId.toObjectId(data.trackerId);
        const userObjectId = MongoCommunityObjectId.toObjectId(data.userId);

        const tracker = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          ownerId: userObjectId,
          ...MongoCommunityQueryUtils.publicTrackerVisibilityQuery(),
          publishedAt: { $ne: null },
          verificationStatus: { $ne: 'verified' },
        }).lean<MongoCommunityTrackerRecord>();

        if (!tracker) {
          return null;
        }

        const existingSubmission = await CommunityVerificationSubmissionModel.findOne({
          trackerId: trackerObjectId,
          ...this.openSubmissionQuery(),
        }).lean<MongoCommunitySubmissionRecord>();

        if (existingSubmission) {
          console.log('Existing submission found:', existingSubmission);
          return this.toSubmissionWithReview(existingSubmission, null);
        }

        const expiresAt = new Date(Date.now() + data.durationHours * 60 * 60 * 1000);

        const submission = await CommunityVerificationSubmissionModel.create({
          trackerId: trackerObjectId,
          ownerId: userObjectId,
          title: tracker.title,
          category: MongoCommunityNormalizer.topic(tracker.category || tracker.field || 'general'),
          excerpt: this.createExcerpt(tracker.description ?? ''),
          passVotes: 0,
          failVotes: 0,
          requiredVotes: data.requiredVotes,
          progress: 0,
          status: 'open',
          urgent: Boolean(data.urgent),
          consensusChoice: null,
          expiresAt,
          deletedAt: null,
        });

        await CommunityTrackerModel.updateOne(
          {
            _id: trackerObjectId,
            ownerId: userObjectId,
            deletedAt: null,
          },
          {
            $set: {
              verificationStatus: 'pending',
              verifiedAt: null,
            },
          }
        );

        const plainSubmission =
          this._mapper.toPlainRecord<MongoCommunitySubmissionRecord>(submission);

        if (!plainSubmission) {
          throw new CommunityDomainError(
            'COMMUNITY_SUBMISSION_MAPPING_FAILED',
            'Failed to map verification submission'
          );
        }

        return this.toSubmissionWithReview(plainSubmission, null);
      }
    );
  }

  async getVerificationStats(userId: string) {
    return this.execute(
      'COMMUNITY_VERIFICATION_STATS_READ_FAILED',
      'Failed to read verification stats',
      async () => {
        await this.expireDueOpenSubmissions();

        const userObjectId = MongoCommunityObjectId.toObjectId(userId);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [awaiting, reviewed, rewardResult, user, activeReviewers] = await Promise.all([
          CommunityVerificationSubmissionModel.countDocuments(this.openSubmissionQuery()),
          CommunityReviewVoteModel.countDocuments({
            userId: userObjectId,
          }),
          CommunityReviewVoteModel.aggregate<{ total: number }>([
            {
              $match: {
                userId: userObjectId,
              },
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: '$rewardCoins',
                },
              },
            },
          ]),
          CommunityUserModel.findById(userObjectId).lean<MongoUserRecord>(),
          CommunityReviewVoteModel.distinct('userId', {
            createdAt: {
              $gte: weekAgo,
            },
          }),
        ]);

        return {
          awaiting,
          reviewed,
          totalEarnedCoins: rewardResult[0]?.total ?? 0,
          coinBalance: Number(user?.coins ?? 0),
          queueCount: awaiting,
          rewardCoins: COMMUNITY_REVIEW_REWARD_COINS,
          activeReviewersThisWeek: activeReviewers.length,
        };
      }
    );
  }

  async getUserCoinBalance(userId: string): Promise<number> {
    return this.execute(
      'COMMUNITY_COIN_BALANCE_READ_FAILED',
      'Failed to read community coin balance',
      async () => {
        if (!MongoCommunityObjectId.isValid(userId)) {
          return 0;
        }

        const user = await CommunityUserModel.findOne({
          _id: MongoCommunityObjectId.toObjectId(userId),
          deletedAt: null,
        })
          .select({
            coins: 1,
          })
          .lean<MongoUserRecord>();

        return Math.max(0, Number(user?.coins ?? 0));
      }
    );
  }

  async findVerificationQueue(query: FindVerificationQueueQuery) {
    return this.execute(
      'COMMUNITY_VERIFICATION_QUEUE_READ_FAILED',
      'Failed to read verification queue',
      async () => {
        await this.expireDueOpenSubmissions();

        const filters = this.openSubmissionQuery(query.userId);
        const skip = (query.page - 1) * query.limit;

        const [submissions, total] = (await Promise.all([
          CommunityVerificationSubmissionModel.find(filters)
            .sort({
              urgent: -1,
              expiresAt: 1,
              createdAt: -1,
            })
            .skip(skip)
            .limit(query.limit)
            .lean<MongoCommunitySubmissionRecord[]>(),
          CommunityVerificationSubmissionModel.countDocuments(filters),
        ])) as [MongoCommunitySubmissionRecord[], number];

        const submissionIds = submissions.map((submission) =>
          MongoCommunityObjectId.toExistingObjectId(submission._id)
        );

        const votes = (await CommunityReviewVoteModel.find({
          submissionId: {
            $in: submissionIds,
          },
          userId: MongoCommunityObjectId.toObjectId(query.userId),
        }).lean<MongoCommunityVoteRecord[]>()) as MongoCommunityVoteRecord[];

        const voteBySubmission = new Map<string, VerificationVoteChoice | undefined>(
          votes.map((vote) => [String(vote.submissionId), vote.choice])
        );

        const items = submissions
          .map((submission) =>
            this._mapper.toSubmissionEntity(
              submission,
              voteBySubmission.get(String(submission._id)) ?? null
            )
          )
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        return {
          items,
          total,
          page: query.page,
          limit: query.limit,
          totalPages: MongoCommunityQueryUtils.calculateTotalPages(total, query.limit),
        };
      }
    );
  }

  async findVerificationSubmissionById(submissionId: string, userId: string) {
    return this.execute(
      'COMMUNITY_VERIFICATION_SUBMISSION_READ_FAILED',
      'Failed to read verification submission',
      async () => {
        await this.expireDueOpenSubmissions();

        if (
          !MongoCommunityObjectId.isValid(submissionId) ||
          !MongoCommunityObjectId.isValid(userId)
        ) {
          return null;
        }

        const submission = await CommunityVerificationSubmissionModel.findOne({
          _id: MongoCommunityObjectId.toObjectId(submissionId),
          deletedAt: null,
        }).lean<MongoCommunitySubmissionRecord>();

        if (!submission) {
          return null;
        }

        const vote = await CommunityReviewVoteModel.findOne({
          submissionId: submission._id,
          userId: MongoCommunityObjectId.toObjectId(userId),
        }).lean<MongoCommunityVoteRecord>();

        return this.toSubmissionWithReview(submission, vote?.choice ?? null);
      }
    );
  }

  async findVoteBySubmissionAndUser(submissionId: string, userId: string) {
    return this.execute(
      'COMMUNITY_VERIFICATION_VOTE_READ_FAILED',
      'Failed to read verification vote',
      async () => {
        if (
          !MongoCommunityObjectId.isValid(submissionId) ||
          !MongoCommunityObjectId.isValid(userId)
        ) {
          return null;
        }

        const vote = await CommunityReviewVoteModel.findOne({
          submissionId: MongoCommunityObjectId.toObjectId(submissionId),
          userId: MongoCommunityObjectId.toObjectId(userId),
        }).lean<MongoCommunityVoteRecord>();

        return this._mapper.toVoteEntity(vote);
      }
    );
  }

  async createVerificationVote(data: CreateCommunityReviewVoteInput) {
    return this.execute(
      'COMMUNITY_VERIFICATION_VOTE_CREATE_FAILED',
      'Failed to create verification vote',
      async () => {
        await this.expireDueOpenSubmissions();

        const submissionId = MongoCommunityObjectId.toObjectId(data.submissionId);
        const userId = MongoCommunityObjectId.toObjectId(data.userId);

        const submission = await CommunityVerificationSubmissionModel.findOne({
          _id: submissionId,
          ...this.openSubmissionQuery(),
        }).lean<MongoCommunitySubmissionRecord>();

        if (!submission) {
          throw new CommunityDomainError(
            'COMMUNITY_VERIFICATION_SUBMISSION_CLOSED',
            'Verification submission is closed or expired'
          );
        }

        const vote = await CommunityReviewVoteModel.create({
          submissionId,
          userId,
          choice: data.choice,
          reason: data.reason ?? null,
          rewardCoins: 0,
        });

        const update = {
          $inc:
            data.choice === 'pass'
              ? {
                  passVotes: 1,
                }
              : {
                  failVotes: 1,
                },
        };

        await CommunityVerificationSubmissionModel.updateOne(
          {
            _id: submissionId,
            status: 'open',
            deletedAt: null,
          },
          update
        );

        await this.closeSubmissionIfConsensusReached(data.submissionId);

        const plainVote = this._mapper.toPlainRecord<MongoCommunityVoteRecord>(vote);

        const voteEntity = this._mapper.toVoteEntity(plainVote);

        if (!voteEntity) {
          throw new CommunityDomainError(
            'COMMUNITY_VOTE_MAPPING_FAILED',
            'Failed to map review vote'
          );
        }

        return voteEntity;
      },
      (error) => this._errorMapper.mapDuplicateVote(error)
    );
  }

  async findUnrewardedMajorityVotes(submissionId: string, choice: VerificationVoteChoice) {
    return this.execute(
      'COMMUNITY_REWARDABLE_VOTES_READ_FAILED',
      'Failed to read rewardable verification votes',
      async () => {
        if (!MongoCommunityObjectId.isValid(submissionId)) {
          return [];
        }

        const votes = (await CommunityReviewVoteModel.find({
          submissionId: MongoCommunityObjectId.toObjectId(submissionId),
          choice,
          $or: [
            {
              rewardCoins: 0,
            },
            {
              rewardCoins: {
                $exists: false,
              },
            },
            {
              rewardCoins: null,
            },
          ],
        }).lean<MongoCommunityVoteRecord[]>()) as MongoCommunityVoteRecord[];

        return votes
          .map((vote) => this._mapper.toVoteEntity(vote))
          .filter((vote): vote is NonNullable<typeof vote> => Boolean(vote));
      }
    );
  }

  async markVerificationVoteRewarded(voteId: string, rewardCoins: number): Promise<boolean> {
    return this.execute(
      'COMMUNITY_VOTE_REWARD_MARK_FAILED',
      'Failed to mark verification vote as rewarded',
      async () => {
        if (!MongoCommunityObjectId.isValid(voteId)) {
          return false;
        }

        const rewardedVote = await CommunityReviewVoteModel.findOneAndUpdate(
          {
            _id: MongoCommunityObjectId.toObjectId(voteId),
            $or: [
              {
                rewardCoins: 0,
              },
              {
                rewardCoins: {
                  $exists: false,
                },
              },
              {
                rewardCoins: null,
              },
            ],
          },
          {
            $set: {
              rewardCoins,
            },
          },
          {
            new: true,
          }
        ).lean<MongoCommunityVoteRecord>();

        if (!rewardedVote) {
          return false;
        }

        return true;
      }
    );
  }

  async findVerificationLeaderboard(userId: string, limit: number) {
    return this.execute(
      'COMMUNITY_LEADERBOARD_READ_FAILED',
      'Failed to read community leaderboard',
      async () => {
        const rows = (await CommunityReviewVoteModel.aggregate<MongoCommunityLeaderboardAggregate>([
          {
            $group: {
              _id: '$userId',
              totalEarned: {
                $sum: '$rewardCoins',
              },
              reviewed: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              totalEarned: -1,
              reviewed: -1,
            },
          },
          {
            $limit: limit,
          },
        ])) as MongoCommunityLeaderboardAggregate[];

        const userIds = rows.map((row) => MongoCommunityObjectId.toExistingObjectId(row._id));

        const [profiles, users] = (await Promise.all([
          CommunityUserProfileModel.find({
            userId: {
              $in: userIds,
            },
            deletedAt: null,
          }).lean<MongoUserProfileRecord[]>(),
          CommunityUserModel.find({
            _id: {
              $in: userIds,
            },
            deletedAt: null,
          }).lean<MongoUserRecord[]>(),
        ])) as [MongoUserProfileRecord[], MongoUserRecord[]];

        const profileByUserId = new Map(
          profiles.map((profile) => [String(profile.userId), profile])
        );

        const userById = new Map(users.map((user) => [String(user._id), user]));

        return rows.map((row, index) =>
          this._mapper.toLeaderboardEntryEntity({
            userId: String(row._id),
            rank: index + 1,
            profile: profileByUserId.get(String(row._id)),
            user: userById.get(String(row._id)),
            earnedCoins: row.totalEarned,
            isCurrentUser: String(row._id) === userId,
          })
        );
      }
    );
  }

  private openSubmissionQuery(excludeOwnerId?: string): SubmissionQuery {
    const query: SubmissionQuery = {
      deletedAt: null,
      status: 'open',
      $or: [
        {
          expiresAt: {
            $exists: false,
          },
        },
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            $gt: new Date(),
          },
        },
      ],
    };

    if (excludeOwnerId) {
      query.ownerId = {
        $ne: MongoCommunityObjectId.toObjectId(excludeOwnerId),
      };
    }

    return query;
  }

  private async toSubmissionWithReview(
    submission: MongoCommunitySubmissionRecord,
    userVote: VerificationVoteChoice | null
  ) {
    const reviewTracker = await this.getVerificationReviewTracker(submission);

    return this._mapper.toSubmissionEntity(
      {
        ...submission,
        reviewTracker,
      },
      userVote
    );
  }

  private async getVerificationReviewTracker(
    submission: MongoCommunitySubmissionRecord
  ): Promise<MongoVerificationReviewTrackerRecord | null> {
    const trackerId = MongoCommunityObjectId.toExistingObjectId(submission.trackerId);

    const [tracker, topics, subtopics] = (await Promise.all([
      CommunityTrackerModel.findOne({
        _id: trackerId,
        deletedAt: null,
      }).lean<MongoCommunityTrackerRecord>(),
      CommunityTrackerTopicModel.find({
        trackerId,
        deletedAt: null,
      })
        .sort({
          order: 1,
        })
        .lean<MongoTrackerTopicRecord[]>(),
      CommunityTrackerSubtopicModel.find({
        trackerId,
        deletedAt: null,
      })
        .sort({
          depth: 1,
          order: 1,
        })
        .lean<MongoTrackerSubtopicRecord[]>(),
    ])) as [
      MongoCommunityTrackerRecord | null,
      MongoTrackerTopicRecord[],
      MongoTrackerSubtopicRecord[],
    ];

    if (!tracker) {
      return null;
    }

    const subtopicsByTopicId = new Map<string, MongoTrackerSubtopicRecord[]>();

    for (const subtopic of subtopics) {
      const topicId = String(subtopic.topicId);
      const items = subtopicsByTopicId.get(topicId) ?? [];

      items.push(subtopic);
      subtopicsByTopicId.set(topicId, items);
    }

    return {
      id: String(tracker._id),
      title: tracker.title,
      description: tracker.description ?? '',
      category: tracker.category ?? 'general',
      field: tracker.field ?? '',
      goal: tracker.goal ?? '',
      level: tracker.level ?? 'beginner',
      tags: tracker.tags ?? [],
      visibility: tracker.visibility ?? 'private',
      status: tracker.status ?? 'active',
      topicsCount: tracker.topicsCount ?? topics.length,
      subtopicsCount: tracker.subtopicsCount ?? subtopics.length,
      topics: topics.map((topic) => ({
        id: String(topic._id),
        title: topic.title,
        description: topic.description ?? '',
        order: topic.order,
        status: topic.status ?? 'active',
        estimatedHours: topic.estimatedHours ?? 0,
        subtopics: (subtopicsByTopicId.get(String(topic._id)) ?? []).map((subtopic) => ({
          id: String(subtopic._id),
          topicId: String(subtopic.topicId),
          parentSubtopicId: subtopic.parentSubtopicId ? String(subtopic.parentSubtopicId) : null,
          title: subtopic.title,
          description: subtopic.description ?? '',
          order: subtopic.order,
          depth: subtopic.depth,
          isLocked: Boolean(subtopic.isLocked),
          estimatedMinutes: subtopic.estimatedMinutes ?? 0,
        })),
      })),
    };
  }

  private async expireDueOpenSubmissions(): Promise<void> {
    const now = new Date();

    const submissions = (await CommunityVerificationSubmissionModel.find({
      status: 'open',
      deletedAt: null,
      expiresAt: {
        $ne: null,
        $lte: now,
      },
    }).lean<MongoCommunitySubmissionRecord[]>()) as MongoCommunitySubmissionRecord[];

    for (const submission of submissions) {
      await CommunityVerificationSubmissionModel.updateOne(
        {
          _id: submission._id,
          status: 'open',
          deletedAt: null,
        },
        {
          $set: {
            status: 'expired',
            progress: this.calculateSubmissionProgress(submission),
            consensusChoice: null,
          },
        }
      );

      await CommunityTrackerModel.updateOne(
        {
          _id: submission.trackerId,
          verificationStatus: 'pending',
          deletedAt: null,
        },
        {
          $set: {
            verificationStatus: null,
            verifiedAt: null,
          },
        }
      );
    }
  }

  private calculateSubmissionProgress(submission: MongoCommunitySubmissionRecord): number {
    const passVotes = Number(submission.passVotes ?? 0);
    const failVotes = Number(submission.failVotes ?? 0);
    const requiredVotes = Math.max(Number(submission.requiredVotes ?? 10), 1);
    const totalVotes = passVotes + failVotes;

    return Math.min(Math.round((totalVotes / requiredVotes) * 100), 100);
  }

  private createExcerpt(value: string): string {
    return value.trim().slice(0, 280);
  }

  private async closeSubmissionIfConsensusReached(submissionId: string): Promise<void> {
    const submission = await CommunityVerificationSubmissionModel.findById(
      MongoCommunityObjectId.toObjectId(submissionId)
    ).lean<MongoCommunitySubmissionRecord>();

    if (!submission || submission.status !== 'open') {
      return;
    }

    const passVotes = Number(submission.passVotes ?? 0);
    const failVotes = Number(submission.failVotes ?? 0);
    const requiredVotes = Math.max(Number(submission.requiredVotes ?? 10), 1);
    const totalVotes = passVotes + failVotes;

    const progress = Math.min(Math.round((totalVotes / requiredVotes) * 100), 100);

    if (totalVotes < requiredVotes) {
      await CommunityVerificationSubmissionModel.updateOne(
        {
          _id: submission._id,
        },
        {
          $set: {
            progress,
          },
        }
      );

      return;
    }

    const consensusChoice: VerificationVoteChoice = passVotes >= failVotes ? 'pass' : 'fail';

    const status = consensusChoice === 'pass' ? 'approved' : 'rejected';

    await CommunityVerificationSubmissionModel.updateOne(
      {
        _id: submission._id,
      },
      {
        $set: {
          status,
          consensusChoice,
          progress: 100,
        },
      }
    );

    await CommunityTrackerModel.updateOne(
      {
        _id: submission.trackerId,
      },
      {
        $set: {
          verificationStatus: consensusChoice === 'pass' ? 'verified' : 'rejected',
          verifiedAt: consensusChoice === 'pass' ? new Date() : null,
        },
      }
    );
  }
}

export const mongoCommunityVerificationRepository = new MongoCommunityVerificationRepository();
