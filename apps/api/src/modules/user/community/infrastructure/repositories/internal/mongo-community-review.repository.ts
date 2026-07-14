import type { CommunityTrackerReviewEntity } from '../../../domain/entities/community-tracker-review.entity';
import type {
  CommunityRatingDistributionEntity,
  CommunityRatingSummaryEntity,
} from '../../../domain/entities/community-public-tracker-detail.entity';
import type {
  ICommunityReviewRepository,
  UpsertCommunityTrackerReviewInput,
} from '../../../domain/repositories/community-review.repository.interface';
import { MongoCommunityBaseRepository } from '../shared/mongo-community-base.repository';
import { MongoCommunityMapper } from '../shared/mongo-community.mapper';
import {
  CommunityTrackerLikeModel,
  CommunityTrackerModel,
  CommunityTrackerReviewModel,
  CommunityTrackerSubtopicModel,
  CommunityTrackerTopicModel,
  CommunityUserModel,
  CommunityUserProfileModel,
} from '../shared/mongo-community.models';
import { MongoCommunityObjectId } from '../shared/mongo-community-object-id';
import type {
  MongoAuthorLookup,
  MongoCommunityTrackerLikeRecord,
  MongoCommunityTrackerRecord,
  MongoCommunityTrackerReviewRecord,
  MongoIdLike,
  MongoRatingAggregate,
  MongoTrackerSubtopicRecord,
  MongoTrackerTopicRecord,
  MongoUserProfileRecord,
  MongoUserRecord,
} from '../shared/mongo-community.types';

export class MongoCommunityReviewRepository
  extends MongoCommunityBaseRepository
  implements ICommunityReviewRepository
{
  constructor(private readonly _mapper = new MongoCommunityMapper()) {
    super();
  }

  async findPublicTrackerDetail(trackerId: string, userId: string) {
    return this.execute(
      'COMMUNITY_PUBLIC_TRACKER_DETAIL_READ_FAILED',
      'Failed to read public tracker detail',
      async () => {
        if (!MongoCommunityObjectId.isValid(trackerId) || !MongoCommunityObjectId.isValid(userId)) {
          return null;
        }

        const trackerObjectId = MongoCommunityObjectId.toObjectId(trackerId);
        const userObjectId = MongoCommunityObjectId.toObjectId(userId);

        const tracker = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          deletedAt: null,
          status: { $ne: 'archived' },
          $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
        }).lean<MongoCommunityTrackerRecord>();

        if (!tracker) {
          return null;
        }

        const [topics, subtopics, ratingSummary, reviews, myReview, author, clone, liked] =
          await Promise.all([
            this.findTopics(trackerObjectId),
            this.findSubtopics(trackerObjectId),
            this.getRatingSummary(trackerObjectId),
            this.findReviews(trackerObjectId, userObjectId, 20),
            this.findMyReview(trackerObjectId, userObjectId),
            this.findAuthor(tracker.ownerId),
            CommunityTrackerModel.findOne({
              ownerId: userObjectId,
              sourceTrackerId: trackerObjectId,
              deletedAt: null,
            }).lean<MongoCommunityTrackerRecord>(),
            CommunityTrackerLikeModel.exists({
              trackerId: trackerObjectId,
              userId: userObjectId,
              deletedAt: null,
            }),
          ]);

        return this._mapper.toPublicTrackerDetailEntity({
          tracker,
          userId,
          clone,
          liked,
          topics,
          subtopics,
          ratingSummary,
          reviews,
          myReview,
          author,
        });
      }
    );
  }

  async upsertTrackerReview(input: UpsertCommunityTrackerReviewInput) {
    return this.execute(
      'COMMUNITY_REVIEW_SAVE_FAILED',
      'Failed to save tracker review',
      async () => {
        if (
          !MongoCommunityObjectId.isValid(input.trackerId) ||
          !MongoCommunityObjectId.isValid(input.userId)
        ) {
          return null;
        }

        const trackerObjectId = MongoCommunityObjectId.toObjectId(input.trackerId);
        const userObjectId = MongoCommunityObjectId.toObjectId(input.userId);

        const tracker = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          deletedAt: null,
          status: { $ne: 'archived' },
          $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
        }).lean<MongoCommunityTrackerRecord>();

        if (!tracker) {
          return null;
        }

        const review = await CommunityTrackerReviewModel.findOneAndUpdate(
          {
            trackerId: trackerObjectId,
            userId: userObjectId,
            deletedAt: null,
          },
          {
            $set: {
              rating: input.rating,
              comment: input.comment,
            },
            $setOnInsert: {
              trackerId: trackerObjectId,
              userId: userObjectId,
              helpfulUserIds: [],
              helpfulCount: 0,
              deletedAt: null,
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
          }
        ).lean<MongoCommunityTrackerReviewRecord>();

        await this.syncTrackerRatingStats(trackerObjectId);

        const author = await this.findAuthor(userObjectId);

        return this._mapper.toReviewEntity(review, input.userId, new Map([[input.userId, author]]));
      }
    );
  }

  async toggleReviewHelpful(reviewId: string, userId: string) {
    return this.execute(
      'COMMUNITY_REVIEW_HELPFUL_TOGGLE_FAILED',
      'Failed to update review helpful state',
      async () => {
        if (!MongoCommunityObjectId.isValid(reviewId) || !MongoCommunityObjectId.isValid(userId)) {
          return null;
        }

        const reviewObjectId = MongoCommunityObjectId.toObjectId(reviewId);
        const userObjectId = MongoCommunityObjectId.toObjectId(userId);

        const review = await CommunityTrackerReviewModel.findOne({
          _id: reviewObjectId,
          deletedAt: null,
        }).lean<MongoCommunityTrackerReviewRecord>();

        if (!review) {
          return null;
        }

        const helpfulUserIds = this._mapper.toHelpfulUserIdStrings(review.helpfulUserIds);
        const hasHelpful = helpfulUserIds.has(userId);

        const updatedReview = await CommunityTrackerReviewModel.findOneAndUpdate(
          {
            _id: reviewObjectId,
            deletedAt: null,
          },
          hasHelpful
            ? {
                $pull: { helpfulUserIds: userObjectId },
                $inc: { helpfulCount: -1 },
              }
            : {
                $addToSet: { helpfulUserIds: userObjectId },
                $inc: { helpfulCount: 1 },
              },
          {
            returnDocument: 'after',
          }
        ).lean<MongoCommunityTrackerReviewRecord>();

        if (!updatedReview) {
          return null;
        }

        const authors = await this.findAuthors([String(updatedReview.userId)]);

        return this._mapper.toReviewEntity(updatedReview, userId, authors);
      }
    );
  }

  async toggleTrackerLike(trackerId: string, userId: string) {
    return this.execute(
      'COMMUNITY_TRACKER_LIKE_TOGGLE_FAILED',
      'Failed to update tracker like state',
      async () => {
        if (!MongoCommunityObjectId.isValid(trackerId) || !MongoCommunityObjectId.isValid(userId)) {
          return null;
        }

        const trackerObjectId = MongoCommunityObjectId.toObjectId(trackerId);
        const userObjectId = MongoCommunityObjectId.toObjectId(userId);

        const tracker = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          deletedAt: null,
          status: { $ne: 'archived' },
          $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
        }).lean<MongoCommunityTrackerRecord>();

        if (!tracker) {
          return null;
        }

        const existingLike = await CommunityTrackerLikeModel.findOne({
          trackerId: trackerObjectId,
          userId: userObjectId,
          deletedAt: null,
        }).lean<MongoCommunityTrackerLikeRecord>();

        const liked = !existingLike;

        if (existingLike) {
          await CommunityTrackerLikeModel.updateOne(
            {
              _id: existingLike._id,
            },
            {
              $set: {
                deletedAt: new Date(),
              },
            }
          );
        } else {
          await CommunityTrackerLikeModel.create({
            trackerId: trackerObjectId,
            userId: userObjectId,
            deletedAt: null,
          });
        }

        const likes = await CommunityTrackerLikeModel.countDocuments({
          trackerId: trackerObjectId,
          deletedAt: null,
        });

        await CommunityTrackerModel.updateOne(
          {
            _id: trackerObjectId,
            deletedAt: null,
          },
          {
            $set: {
              likeCount: likes,
            },
          }
        );

        return {
          liked,
          likes,
        };
      }
    );
  }

  private async findTopics(trackerId: MongoIdLike) {
    return (await CommunityTrackerTopicModel.find({
      trackerId: MongoCommunityObjectId.toExistingObjectId(trackerId),
      deletedAt: null,
    })
      .sort({ order: 1 })
      .lean<MongoTrackerTopicRecord[]>()) as MongoTrackerTopicRecord[];
  }

  private async findSubtopics(trackerId: MongoIdLike) {
    return (await CommunityTrackerSubtopicModel.find({
      trackerId: MongoCommunityObjectId.toExistingObjectId(trackerId),
      deletedAt: null,
    })
      .sort({ depth: 1, order: 1 })
      .lean<MongoTrackerSubtopicRecord[]>()) as MongoTrackerSubtopicRecord[];
  }

  private async findReviews(trackerId: MongoIdLike, userId: MongoIdLike, limit: number) {
    const reviews = (await CommunityTrackerReviewModel.find({
      trackerId: MongoCommunityObjectId.toExistingObjectId(trackerId),
      deletedAt: null,
    })
      .sort({ helpfulCount: -1, createdAt: -1 })
      .limit(limit)
      .lean<MongoCommunityTrackerReviewRecord[]>()) as MongoCommunityTrackerReviewRecord[];

    return this.toReviewEntities(reviews, userId.toString());
  }

  private async findMyReview(trackerId: MongoIdLike, userId: MongoIdLike) {
    const review = await CommunityTrackerReviewModel.findOne({
      trackerId: MongoCommunityObjectId.toExistingObjectId(trackerId),
      userId: MongoCommunityObjectId.toExistingObjectId(userId),
      deletedAt: null,
    }).lean<MongoCommunityTrackerReviewRecord>();

    const authors = review ? await this.findAuthors([String(review.userId)]) : undefined;

    return this._mapper.toReviewEntity(review, userId.toString(), authors);
  }

  private async getRatingSummary(trackerId: MongoIdLike): Promise<CommunityRatingSummaryEntity> {
    const rows = (await CommunityTrackerReviewModel.aggregate<MongoRatingAggregate>([
      {
        $match: {
          trackerId: MongoCommunityObjectId.toExistingObjectId(trackerId),
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ])) as MongoRatingAggregate[];

    const distribution: CommunityRatingDistributionEntity = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let total = 0;
    let weightedTotal = 0;

    for (const row of rows) {
      const rating = Math.min(Math.max(Number(row._id), 1), 5) as 1 | 2 | 3 | 4 | 5;
      const count = Number(row.count ?? 0);

      distribution[rating] = count;
      total += count;
      weightedTotal += rating * count;
    }

    return {
      average: total > 0 ? weightedTotal / total : 0,
      count: total,
      distribution,
    };
  }

  private async syncTrackerRatingStats(trackerId: MongoIdLike): Promise<void> {
    const summary = await this.getRatingSummary(trackerId);

    await CommunityTrackerModel.updateOne(
      {
        _id: MongoCommunityObjectId.toExistingObjectId(trackerId),
        deletedAt: null,
      },
      {
        $set: {
          ratingAverage: Number(summary.average.toFixed(2)),
          ratingCount: summary.count,
        },
      }
    );
  }

  private async toReviewEntities(
    reviews: MongoCommunityTrackerReviewRecord[],
    currentUserId: string
  ): Promise<CommunityTrackerReviewEntity[]> {
    const userIds = [...new Set(reviews.map((review) => String(review.userId)))];
    const authors = await this.findAuthors(userIds);

    return reviews
      .map((review) => this._mapper.toReviewEntity(review, currentUserId, authors))
      .filter((review): review is CommunityTrackerReviewEntity => Boolean(review));
  }

  private async findAuthor(ownerId: MongoIdLike): Promise<MongoAuthorLookup> {
    const [profile, user] = (await Promise.all([
      CommunityUserProfileModel.findOne({
        userId: MongoCommunityObjectId.toExistingObjectId(ownerId),
        deletedAt: null,
      }).lean<MongoUserProfileRecord>(),
      CommunityUserModel.findById(
        MongoCommunityObjectId.toExistingObjectId(ownerId)
      ).lean<MongoUserRecord>(),
    ])) as [MongoUserProfileRecord | null, MongoUserRecord | null];

    return this._mapper.toAuthorLookup({
      id: ownerId,
      profile,
      user,
      fallbackName: 'Community mentor',
    });
  }

  private async findAuthors(userIds: string[]): Promise<Map<string, MongoAuthorLookup>> {
    if (!userIds.length) {
      return new Map();
    }

    const objectIds = userIds.map((userId) => MongoCommunityObjectId.toObjectId(userId));

    const [profiles, users] = (await Promise.all([
      CommunityUserProfileModel.find({
        userId: { $in: objectIds },
        deletedAt: null,
      }).lean<MongoUserProfileRecord[]>(),
      CommunityUserModel.find({
        _id: { $in: objectIds },
        deletedAt: null,
      }).lean<MongoUserRecord[]>(),
    ])) as [MongoUserProfileRecord[], MongoUserRecord[]];

    const profileByUserId = new Map(profiles.map((profile) => [String(profile.userId), profile]));
    const userById = new Map(users.map((user) => [String(user._id), user]));

    return new Map(
      userIds.map((userId) => {
        const profile = profileByUserId.get(userId);
        const user = userById.get(userId);
        return [
          userId,
          this._mapper.toAuthorLookup({
            id: userId,
            profile,
            user,
            fallbackName: `Scholar ${userId.slice(-4)}`,
          }),
        ];
      })
    );
  }
}

export const mongoCommunityReviewRepository = new MongoCommunityReviewRepository();
