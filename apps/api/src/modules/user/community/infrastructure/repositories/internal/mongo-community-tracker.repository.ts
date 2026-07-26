import { CommunityDomainError } from '../../../domain/community-domain.error';
import type { FindCommunityTrackersQuery } from '../../../domain/repositories/community-tracker.repository.interface';
import { MongoCommunityBaseRepository } from '../shared/mongo-community-base.repository';
import { MongoCommunityErrorMapper } from '../shared/mongo-community-error.mapper';
import { MongoCommunityMapper } from '../shared/mongo-community.mapper';
import {
  CommunityTrackerModel,
  CommunityTrackerProgressModel,
  CommunityTrackerSubtopicModel,
  CommunityTrackerTopicModel,
  CommunityUserProfileModel,
} from '../shared/mongo-community.models';
import { MongoCommunityNormalizer } from '../shared/mongo-community-normalizer';
import { MongoCommunityObjectId } from '../shared/mongo-community-object-id';
import { MongoCommunityQueryUtils } from '../shared/mongo-community-query.utils';
import type {
  MongoCommunityTrackerRecord,
  MongoIdLike,
  MongoTrackerProgressRecord,
  MongoTrackerSubtopicRecord,
  MongoTrackerTopicRecord,
  MongoUserProfileRecord,
} from '../shared/mongo-community.types';

type TrackerQuery = Record<string, unknown>;

export class MongoCommunityTrackerRepository extends MongoCommunityBaseRepository {
  constructor(
    private readonly _mapper = new MongoCommunityMapper(),
    private readonly _errorMapper = new MongoCommunityErrorMapper()
  ) {
    super();
  }

  async findPublicTrackers(query: FindCommunityTrackersQuery) {
    return this.execute(
      'COMMUNITY_TRACKERS_READ_FAILED',
      'Failed to read community trackers',
      async () => {
        if (this.isPersonalizedSuggestionQuery(query)) {
          return this.findPersonalizedSuggestions(query);
        }

        const filters = this.buildPublicTrackerQuery(query);
        const sort = this.buildTrackerSort(query.sort);
        const skip = (query.page - 1) * query.limit;

        const [items, total] = (await Promise.all([
          CommunityTrackerModel.find(filters)
            .sort(sort)
            .skip(skip)
            .limit(query.limit)
            .lean<MongoCommunityTrackerRecord[]>(),
          CommunityTrackerModel.countDocuments(filters),
        ])) as [MongoCommunityTrackerRecord[], number];

        const markedItems = await this.markDashboardTrackers(items, query.userId);
        const trackers = markedItems
          .map((item) => this._mapper.toTrackerEntity(item, query.userId))
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        return {
          items: trackers,
          total,
          page: query.page,
          limit: query.limit,
          totalPages: MongoCommunityQueryUtils.calculateTotalPages(total, query.limit),
        };
      }
    );
  }

  private isPersonalizedSuggestionQuery(query: FindCommunityTrackersQuery): boolean {
    return (
      !MongoCommunityNormalizer.search(query.search) &&
      !query.topics?.length &&
      (query.minRating === null || query.minRating === undefined) &&
      !query.verifiedOnly &&
      (!query.sort || query.sort === 'top-rated')
    );
  }

  private async findPersonalizedSuggestions(query: FindCommunityTrackersQuery) {
    const userObjectId = MongoCommunityObjectId.toObjectId(query.userId);
    const [ownedTrackers, clonedSourceIds, dashboardProgressRows] = (await Promise.all([
      CommunityTrackerModel.find({
        ownerId: userObjectId,
        deletedAt: null,
      })
        .select('title category field goal tags sourceTrackerId')
        .sort({ lastActiveAt: -1, updatedAt: -1 })
        .limit(50)
        .lean<MongoCommunityTrackerRecord[]>(),
      CommunityTrackerModel.distinct('sourceTrackerId', {
        ownerId: userObjectId,
        sourceTrackerId: { $exists: true, $ne: null },
        deletedAt: null,
      }),
      CommunityTrackerProgressModel.find({
        userId: userObjectId,
      })
        .select('trackerId')
        .lean<MongoTrackerProgressRecord[]>(),
    ])) as [MongoCommunityTrackerRecord[], MongoIdLike[], MongoTrackerProgressRecord[]];

    const recentSearches = (query.recentSearches ?? [])
      .map((value) => MongoCommunityNormalizer.search(value))
      .filter((value): value is string => Boolean(value))
      .slice(0, 8);
    const categories = new Set(
      ownedTrackers
        .map((tracker) => MongoCommunityNormalizer.topic(tracker.category ?? ''))
        .filter(Boolean)
    );
    const fields = new Set(
      ownedTrackers
        .map((tracker) => MongoCommunityNormalizer.topic(tracker.field ?? ''))
        .filter(Boolean)
    );
    const tags = new Set(
      ownedTrackers
        .flatMap((tracker) => tracker.tags ?? [])
        .map((tag) => MongoCommunityNormalizer.topic(String(tag)))
        .filter(Boolean)
    );
    const interestTerms = new Set(
      [...ownedTrackers.map((tracker) => tracker.title), ...recentSearches]
        .flatMap((value) =>
          String(value ?? '')
            .toLowerCase()
            .split(/[^\p{L}\p{N}+#.]+/u)
        )
        .map((value) => value.trim())
        .filter((value) => value.length >= 2)
        .slice(0, 60)
    );

    const dashboardTrackerIds = [
      ...clonedSourceIds,
      ...dashboardProgressRows.map((progress) => progress.trackerId),
    ];
    const candidateQuery: TrackerQuery = {
      ...MongoCommunityQueryUtils.publicTrackerVisibilityQuery(),
      ownerId: { $ne: userObjectId },
    };

    if (dashboardTrackerIds.length) {
      candidateQuery._id = { $nin: dashboardTrackerIds };
    }

    const candidates = (await CommunityTrackerModel.find(candidateQuery)
      .sort({ ratingAverage: -1, cloneCount: -1, createdAt: -1 })
      .limit(200)
      .lean<MongoCommunityTrackerRecord[]>()) as MongoCommunityTrackerRecord[];

    const score = (tracker: MongoCommunityTrackerRecord) => {
      const category = MongoCommunityNormalizer.topic(tracker.category ?? '');
      const field = MongoCommunityNormalizer.topic(tracker.field ?? '');
      const trackerTags = (tracker.tags ?? []).map((tag) =>
        MongoCommunityNormalizer.topic(String(tag))
      );
      const searchable = [
        tracker.title,
        tracker.description,
        tracker.goal,
        tracker.category,
        tracker.field,
        ...trackerTags,
      ]
        .join(' ')
        .toLowerCase();

      let relevance = 0;
      if (category && categories.has(category)) relevance += 8;
      if (field && fields.has(field)) relevance += 6;
      relevance += trackerTags.filter((tag) => tags.has(tag)).length * 4;
      for (const term of interestTerms) {
        if (searchable.includes(term)) relevance += 2;
      }
      for (const search of recentSearches) {
        if (searchable.includes(search.toLowerCase())) relevance += 10;
      }
      return relevance;
    };

    const ranked = candidates
      .map((tracker) => ({ tracker, score: score(tracker) }))
      .sort(
        (left, right) =>
          right.score - left.score ||
          Number(right.tracker.ratingAverage ?? 0) - Number(left.tracker.ratingAverage ?? 0) ||
          Number(right.tracker.cloneCount ?? 0) - Number(left.tracker.cloneCount ?? 0)
      )
      .slice(0, Math.min(query.limit, 15))
      .map(({ tracker }) => tracker);
    const markedItems = await this.markDashboardTrackers(ranked, query.userId);
    const trackers = markedItems
      .map((item) => this._mapper.toTrackerEntity(item, query.userId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return {
      items: trackers,
      total: trackers.length,
      page: 1,
      limit: Math.min(query.limit, 15),
      totalPages: trackers.length ? 1 : 0,
    };
  }

  async findCommunityTrackerById(trackerId: string, userId: string) {
    return this.execute(
      'COMMUNITY_TRACKER_READ_FAILED',
      'Failed to read community tracker',
      async () => {
        if (!MongoCommunityObjectId.isValid(trackerId)) {
          return null;
        }

        const tracker = await CommunityTrackerModel.findOne({
          _id: MongoCommunityObjectId.toObjectId(trackerId),
          ...MongoCommunityQueryUtils.publicTrackerVisibilityQuery(),
        }).lean<MongoCommunityTrackerRecord>();

        if (!tracker) {
          return null;
        }

        const [markedTracker] = await this.markDashboardTrackers([tracker], userId);

        return this._mapper.toTrackerEntity(markedTracker, userId);
      }
    );
  }

  async cloneTrackerForUser(
    trackerId: string,
    userId: string,
    _options?: { bypassClonePermission?: boolean }
  ) {
    return this.execute(
      'COMMUNITY_TRACKER_CLONE_FAILED',
      'Failed to clone community tracker',
      async () => {
        if (!MongoCommunityObjectId.isValid(trackerId) || !MongoCommunityObjectId.isValid(userId)) {
          return null;
        }

        const trackerObjectId = MongoCommunityObjectId.toObjectId(trackerId);
        const userObjectId = MongoCommunityObjectId.toObjectId(userId);

        const source = await CommunityTrackerModel.findOne({
          _id: trackerObjectId,
          ...MongoCommunityQueryUtils.publicTrackerVisibilityQuery(),
        }).lean<MongoCommunityTrackerRecord>();

        if (!source) {
          return null;
        }

        if (source.ownerId.toString() === userId) {
          const owned = this._mapper.toTrackerEntity({ ...source, inDashboard: true }, userId);

          return owned ?? null;
        }

        const existingClone = await CommunityTrackerModel.findOne({
          ownerId: userObjectId,
          sourceTrackerId: MongoCommunityObjectId.toExistingObjectId(source._id),
          deletedAt: null,
        }).lean<MongoCommunityTrackerRecord>();

        if (existingClone) {
          const existing = this._mapper.toTrackerEntity(
            { ...existingClone, inDashboard: true },
            userId
          );

          return existing ?? null;
        }

        const clone = await CommunityTrackerModel.create(this.prepareCloneData(source, userId));
        const plainClone = this._mapper.toPlainRecord<MongoCommunityTrackerRecord>(clone);

        if (!plainClone) {
          throw new CommunityDomainError(
            'COMMUNITY_CLONE_MAPPING_FAILED',
            'Failed to map cloned tracker'
          );
        }

        await this.cloneTrackerContent(source._id, plainClone._id);
        await this.createInitialProgress(userId, plainClone);
        await CommunityTrackerModel.updateOne({ _id: source._id }, { $inc: { cloneCount: 1 } });

        const entity = this._mapper.toTrackerEntity({ ...plainClone, inDashboard: true }, userId);

        if (!entity) {
          throw new CommunityDomainError(
            'COMMUNITY_CLONE_MAPPING_FAILED',
            'Failed to map cloned tracker'
          );
        }

        return entity;
      },
      (error) => this._errorMapper.mapDuplicateClone(error)
    );
  }

  async getPersonalStats(userId: string) {
    return this.execute(
      'COMMUNITY_STATS_READ_FAILED',
      'Failed to read community stats',
      async () => {
        const ownerId = MongoCommunityObjectId.toObjectId(userId);
        const publishedQuery = {
          ...MongoCommunityQueryUtils.publicTrackerVisibilityQuery(),
          ownerId,
        };
        const clonedQuery = {
          ownerId,
          sourceTrackerId: { $exists: true, $ne: null },
          deletedAt: null,
        };

        const [published, clonedByUser, profile] = (await Promise.all([
          CommunityTrackerModel.find(publishedQuery).lean<MongoCommunityTrackerRecord[]>(),
          CommunityTrackerModel.countDocuments(clonedQuery),
          CommunityUserProfileModel.findOne({
            userId: ownerId,
            deletedAt: null,
          }).lean<MongoUserProfileRecord>(),
        ])) as [MongoCommunityTrackerRecord[], number, MongoUserProfileRecord | null];

        const publishedCount = published.length || Number(profile?.publishedCount ?? 0);
        const clonesReceived =
          published.reduce((total, tracker) => total + Number(tracker.cloneCount ?? 0), 0) ||
          Number(profile?.cloneCount ?? 0);
        const ratingTotal = published.reduce(
          (total, tracker) => total + Number(tracker.ratingAverage ?? 0),
          0
        );
        const averageRating =
          published.length > 0
            ? ratingTotal / published.length
            : Number(profile?.ratingAverage ?? 0);

        return this._mapper.toStatsEntity({
          publishedCount,
          clonesReceived,
          clonedByUser,
          averageRating,
        });
      }
    );
  }

  async findAvailableTopics() {
    return this.execute(
      'COMMUNITY_TOPICS_READ_FAILED',
      'Failed to read community topics',
      async () => {
        const topics = (await CommunityTrackerModel.distinct('category', {
          ...MongoCommunityQueryUtils.publicTrackerVisibilityQuery(),
          category: { $exists: true, $ne: '' },
        })) as string[];

        return topics
          .map((topic) => MongoCommunityNormalizer.topic(String(topic)))
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
      }
    );
  }

  private async markDashboardTrackers(
    trackers: MongoCommunityTrackerRecord[],
    userId: string
  ): Promise<MongoCommunityTrackerRecord[]> {
    if (!trackers.length) {
      return trackers;
    }

    const userObjectId = MongoCommunityObjectId.toObjectId(userId);
    const trackerIds = trackers.map((tracker) =>
      MongoCommunityObjectId.toExistingObjectId(tracker._id)
    );
    const [clones, progressRows] = (await Promise.all([
      CommunityTrackerModel.find({
        ownerId: userObjectId,
        sourceTrackerId: { $in: trackerIds },
        deletedAt: null,
      }).lean<MongoCommunityTrackerRecord[]>(),
      CommunityTrackerProgressModel.find({
        userId: userObjectId,
        trackerId: { $in: trackerIds },
      }).lean<MongoTrackerProgressRecord[]>(),
    ])) as [MongoCommunityTrackerRecord[], MongoTrackerProgressRecord[]];

    const clonedSourceIds = new Set(
      clones
        .map((clone) => clone.sourceTrackerId?.toString())
        .filter((value): value is string => Boolean(value))
    );
    const progressTrackerIds = new Set(
      progressRows.map((progress) => progress.trackerId.toString())
    );

    return trackers.map((tracker) => ({
      ...tracker,
      inDashboard:
        tracker.ownerId.toString() === userId ||
        clonedSourceIds.has(tracker._id.toString()) ||
        progressTrackerIds.has(tracker._id.toString()),
    }));
  }

  private buildPublicTrackerQuery(query: FindCommunityTrackersQuery): TrackerQuery {
    const search = MongoCommunityNormalizer.search(query.search);
    const filters: TrackerQuery = {
      ...MongoCommunityQueryUtils.publicTrackerVisibilityQuery(),
    };

    if (search) {
      const regex = new RegExp(MongoCommunityQueryUtils.escapeRegex(search), 'i');

      filters.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { field: regex },
        { tags: regex },
      ];
    }

    if (query.topics?.length) {
      filters.category = {
        $in: query.topics.map((topic) => MongoCommunityNormalizer.topic(topic)).filter(Boolean),
      };
    }

    if (query.minRating !== null && query.minRating !== undefined) {
      filters.ratingAverage = { $gte: query.minRating };
    }

    if (query.verifiedOnly) {
      filters.verificationStatus = 'verified';
    }

    return filters;
  }

  private buildTrackerSort(sort?: string): Record<string, 1 | -1> {
    if (sort === 'most-cloned') {
      return { cloneCount: -1, createdAt: -1 };
    }

    if (sort === 'newest') {
      return { createdAt: -1 };
    }

    return { ratingAverage: -1, cloneCount: -1, createdAt: -1 };
  }

  private prepareCloneData(source: MongoCommunityTrackerRecord, userId: string) {
    const now = new Date();

    return {
      ownerId: MongoCommunityObjectId.toObjectId(userId),
      title: source.title,
      slug: this.createCloneSlug(source, userId),
      description: source.description ?? '',
      category: source.category ?? 'general',
      field: source.field ?? '',
      goal: source.goal ?? '',
      level: source.level ?? 'beginner',
      tags: source.tags ?? [],
      allowClone: false,
      sourceTrackerId: MongoCommunityObjectId.toExistingObjectId(source._id),
      visibility: 'private',
      status: 'active',
      verificationStatus: null,
      verifiedAt: null,
      isAIGenerated: Boolean(source.isAIGenerated),
      coverImageUrl: source.coverImageUrl ?? '',
      topicsCount: source.topicsCount ?? 0,
      subtopicsCount: source.subtopicsCount ?? 0,
      cloneCount: 0,
      likeCount: 0,
      saveCount: 0,
      progressPercent: 0,
      ratingAverage: 0,
      ratingCount: 0,
      publishedAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  private async cloneTrackerContent(
    sourceTrackerId: MongoIdLike,
    clonedTrackerId: MongoIdLike
  ): Promise<void> {
    const sourceTrackerObjectId = MongoCommunityObjectId.toExistingObjectId(sourceTrackerId);
    const clonedTrackerObjectId = MongoCommunityObjectId.toExistingObjectId(clonedTrackerId);

    const sourceTopics = (await CommunityTrackerTopicModel.find({
      trackerId: sourceTrackerObjectId,
      deletedAt: null,
    })
      .sort({ order: 1 })
      .lean<MongoTrackerTopicRecord[]>()) as MongoTrackerTopicRecord[];

    const topicIdMap = new Map<string, MongoIdLike>();

    for (const topic of sourceTopics) {
      const createdTopic = await CommunityTrackerTopicModel.create({
        trackerId: clonedTrackerObjectId,
        sourceTopicId: MongoCommunityObjectId.toExistingObjectId(topic._id),
        title: topic.title,
        description: topic.description ?? '',
        order: topic.order,
        status: topic.order === 1 ? 'active' : (topic.status ?? 'locked'),
        learningVideo: topic.learningVideo ?? null,
        progressPercent: 0,
        deletedAt: null,
      });

      topicIdMap.set(String(topic._id), createdTopic._id as MongoIdLike);
    }

    const sourceSubtopics = (await CommunityTrackerSubtopicModel.find({
      trackerId: sourceTrackerObjectId,
      deletedAt: null,
    })
      .sort({ depth: 1, order: 1 })
      .lean<MongoTrackerSubtopicRecord[]>()) as MongoTrackerSubtopicRecord[];

    const subtopicIdMap = new Map<string, MongoIdLike>();

    for (const subtopic of sourceSubtopics) {
      const mappedTopicId = topicIdMap.get(String(subtopic.topicId));

      if (!mappedTopicId) {
        continue;
      }

      const mappedParentId = subtopic.parentSubtopicId
        ? (subtopicIdMap.get(String(subtopic.parentSubtopicId)) ?? null)
        : null;
      const createdSubtopic = await CommunityTrackerSubtopicModel.create({
        trackerId: clonedTrackerObjectId,
        topicId: MongoCommunityObjectId.toExistingObjectId(mappedTopicId),
        sourceSubtopicId: MongoCommunityObjectId.toExistingObjectId(subtopic._id),
        parentSubtopicId: mappedParentId
          ? MongoCommunityObjectId.toExistingObjectId(mappedParentId)
          : null,
        title: subtopic.title,
        description: subtopic.description ?? '',
        order: subtopic.order,
        depth: subtopic.depth,
        isLocked: subtopic.depth === 1 ? false : Boolean(subtopic.isLocked),
        learningVideo: subtopic.learningVideo ?? null,
        deletedAt: null,
      });

      subtopicIdMap.set(String(subtopic._id), createdSubtopic._id as MongoIdLike);
    }
  }

  private async createInitialProgress(
    userId: string,
    tracker: MongoCommunityTrackerRecord
  ): Promise<void> {
    await CommunityTrackerProgressModel.findOneAndUpdate(
      {
        userId: MongoCommunityObjectId.toObjectId(userId),
        trackerId: MongoCommunityObjectId.toExistingObjectId(tracker._id),
      },
      {
        $setOnInsert: {
          totalTopics: tracker.topicsCount ?? 0,
          completedTopics: 0,
          totalSubtopics: tracker.subtopicsCount ?? 0,
          completedSubtopics: 0,
          completionPercentage: 0,
          lastStudiedAt: null,
          startedAt: new Date(),
          completedAt: null,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
  }

  private createCloneSlug(source: MongoCommunityTrackerRecord, userId: string): string {
    const sourceSlug = source.slug || this.slugify(source.title);
    const suffix = `${userId.slice(-6)}-${Date.now().toString(36)}`;

    return `${sourceSlug}-clone-${suffix}`.toLowerCase().slice(0, 120);
  }

  private slugify(value: string): string {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || 'community-tracker';
  }
}

export const mongoCommunityTrackerRepository = new MongoCommunityTrackerRepository();
