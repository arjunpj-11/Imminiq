import { Types } from 'mongoose';

import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { TrackerSubtopic } from '../../../../../infrastructure/database/models/tracker-subtopic.model';
import { TrackerTopic } from '../../../../../infrastructure/database/models/tracker-topic.model';
import { TrackerTopicContribution } from '../../../../../infrastructure/database/models/tracker-topic-contribution.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import { TrackerClan } from '../../../../../infrastructure/database/models/tracker-clan.model';
import type {
  ITrackerTopicContributionRepository,
  TrackerTopicContributionRecord,
} from '../../domain';

type ContributionLeanRecord = {
  _id: unknown;
  sourceTrackerId: unknown;
  cloneTrackerId: unknown;
  cloneTopicId: unknown;
  requesterId: unknown;
  ownerId: unknown;
  title: string;
  description?: string;
  subtopics?: Array<{
    sourceId: string;
    parentSourceId?: string | null;
    title: string;
    description?: string;
    order: number;
    depth: number;
    isLocked?: boolean;
    learningVideo?: unknown;
  }>;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date | null;
  mergedTopicId?: unknown | null;
  reviewNote?: string | null;
  rejectionReason?: string | null;
};

type RequesterRecord = {
  _id: unknown;
  fullName?: string;
  username?: string;
  avatarUrl?: string | null;
};

const toObjectId = (value: string) =>
  Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;

export class MongoTrackerTopicContributionRepository
  implements ITrackerTopicContributionRepository
{
  async create(input: { cloneTrackerId: string; cloneTopicId: string; requesterId: string }) {
    const cloneTrackerId = toObjectId(input.cloneTrackerId);
    const cloneTopicId = toObjectId(input.cloneTopicId);
    const requesterId = toObjectId(input.requesterId);
    if (!cloneTrackerId || !cloneTopicId || !requesterId) {
      return { ok: false as const, reason: 'tracker-not-found' as const };
    }

    const clone = await Tracker.findOne({
      _id: cloneTrackerId,
      ownerId: requesterId,
      deletedAt: null,
    }).lean();
    if (!clone) return { ok: false as const, reason: 'tracker-not-found' as const };
    if (!clone.sourceTrackerId) return { ok: false as const, reason: 'not-a-clone' as const };

    const source = await Tracker.findOne({
      _id: clone.sourceTrackerId,
      deletedAt: null,
      $or: [{ visibility: 'public' }, { publishedAt: { $ne: null } }],
      moderationStatus: { $in: ['active', null] },
    }).lean();
    if (!source) return { ok: false as const, reason: 'source-unavailable' as const };

    const topic = await TrackerTopic.findOne({
      _id: cloneTopicId,
      trackerId: cloneTrackerId,
      deletedAt: null,
    }).lean();
    if (!topic) return { ok: false as const, reason: 'topic-not-found' as const };

    const sourceTopics = await TrackerTopic.find({
      trackerId: source._id,
      deletedAt: null,
    })
      .select('_id title description')
      .lean();
    const topicSignature = this.topicSignature(topic.title, topic.description);
    const matchesOriginalTopic = sourceTopics.some(
      (sourceTopic) =>
        this.topicSignature(sourceTopic.title, sourceTopic.description) === topicSignature
    );
    if (topic.sourceTopicId || matchesOriginalTopic) {
      return { ok: false as const, reason: 'not-a-change' as const };
    }

    const existing = await TrackerTopicContribution.exists({
      requesterId,
      cloneTopicId,
    });
    if (existing) return { ok: false as const, reason: 'duplicate' as const };

    const subtopics = await TrackerSubtopic.find({
      trackerId: cloneTrackerId,
      topicId: cloneTopicId,
      deletedAt: null,
    })
      .sort({ depth: 1, order: 1 })
      .lean();

    try {
      const created = await TrackerTopicContribution.create({
        sourceTrackerId: source._id,
        cloneTrackerId,
        cloneTopicId,
        requesterId,
        ownerId: source.ownerId,
        title: topic.title,
        description: topic.description ?? '',
        subtopics: subtopics.map((subtopic) => ({
          sourceId: subtopic._id.toString(),
          parentSourceId: subtopic.parentSubtopicId?.toString() ?? null,
          title: subtopic.title,
          description: subtopic.description ?? '',
          order: subtopic.order,
          depth: subtopic.depth,
          isLocked: Boolean(subtopic.isLocked),
          learningVideo: subtopic.learningVideo ?? null,
        })),
      });
      const requester = await this.findRequester(requesterId);
      return {
        ok: true as const,
        contribution: this.toRecord(
          created.toObject() as unknown as ContributionLeanRecord,
          requester
        ),
        sourceTrackerTitle: source.title,
      };
    } catch (error) {
      if (this.isDuplicateKey(error)) return { ok: false as const, reason: 'duplicate' as const };
      throw error;
    }
  }

  async listForOwner(input: { sourceTrackerId: string; ownerId: string }) {
    const sourceTrackerId = toObjectId(input.sourceTrackerId);
    const ownerId = toObjectId(input.ownerId);
    if (!sourceTrackerId || !ownerId) {
      return { ok: false as const, reason: 'tracker-not-found' as const };
    }

    const tracker = await Tracker.findOne({ _id: sourceTrackerId, deletedAt: null })
      .select('_id ownerId sourceTrackerId')
      .lean();
    if (!tracker) return { ok: false as const, reason: 'tracker-not-found' as const };

    const role = await this.getClanRole(
      sourceTrackerId,
      (tracker as { ownerId?: unknown }).ownerId,
      ownerId
    );
    const ownsClone = Boolean(tracker.sourceTrackerId) && role === 'owner';
    if (!ownsClone && role !== 'owner' && role !== 'co_owner') {
      return { ok: false as const, reason: 'tracker-not-found' as const };
    }

    const contributionQuery = ownsClone
      ? { cloneTrackerId: sourceTrackerId, requesterId: ownerId }
      : { sourceTrackerId };
    const contributions = (await TrackerTopicContribution.find(contributionQuery)
      .sort({ status: 1, createdAt: -1 })
      .limit(100)
      .lean()) as unknown as ContributionLeanRecord[];
    const requesterIds = [...new Set(contributions.map((item) => String(item.requesterId)))];
    const requesters = (await User.find({ _id: { $in: requesterIds }, deletedAt: null })
      .select('_id fullName username avatarUrl')
      .lean()) as unknown as RequesterRecord[];
    const requesterMap = new Map(requesters.map((requester) => [String(requester._id), requester]));

    return {
      ok: true as const,
      contributions: contributions.map((item) =>
        this.toRecord(item, requesterMap.get(String(item.requesterId)))
      ),
    };
  }

  async review(input: {
    sourceTrackerId: string;
    contributionId: string;
    ownerId: string;
    action: 'approve' | 'reject';
    reviewNote?: string;
  }) {
    const sourceTrackerId = toObjectId(input.sourceTrackerId);
    const contributionId = toObjectId(input.contributionId);
    const ownerId = toObjectId(input.ownerId);
    if (!sourceTrackerId || !contributionId || !ownerId) {
      return { ok: false as const, reason: 'contribution-not-found' as const };
    }

    const source = await Tracker.findOne({ _id: sourceTrackerId, deletedAt: null }).lean();
    if (!source) return { ok: false as const, reason: 'tracker-not-found' as const };
    const role = await this.getClanRole(sourceTrackerId, source.ownerId, ownerId);
    if (role !== 'owner' && role !== 'co_owner') {
      return { ok: false as const, reason: 'tracker-not-found' as const };
    }

    if (input.action === 'reject') {
      const rejected = (await TrackerTopicContribution.findOneAndUpdate(
        { _id: contributionId, sourceTrackerId, status: 'pending' },
        {
          $set: {
            status: 'rejected',
            reviewNote: input.reviewNote?.trim() || null,
            rejectionReason: input.reviewNote?.trim() || null,
            reviewedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      ).lean()) as ContributionLeanRecord | null;
      if (!rejected) return this.reviewFailure(contributionId, sourceTrackerId);
      const requester = await this.findRequester(rejected.requesterId);
      return {
        ok: true as const,
        contribution: this.toRecord(rejected, requester),
        sourceTrackerTitle: source.title,
      };
    }

    const claimed = (await TrackerTopicContribution.findOneAndUpdate(
      { _id: contributionId, sourceTrackerId, status: 'pending' },
      { $set: { status: 'processing' } },
      { returnDocument: 'after' }
    ).lean()) as ContributionLeanRecord | null;
    if (!claimed) return this.reviewFailure(contributionId, sourceTrackerId);

    let mergedTopicId: Types.ObjectId | null = null;
    let mergedSubtopicsCount = 0;
    let countsIncremented = false;
    try {
      const lastTopic = await TrackerTopic.findOne({ trackerId: sourceTrackerId, deletedAt: null })
        .sort({ order: -1 })
        .select('order')
        .lean();
      const mergedTopic = await TrackerTopic.create({
        trackerId: sourceTrackerId,
        title: claimed.title,
        description: claimed.description ?? '',
        order: (lastTopic?.order ?? 0) + 1,
        status: lastTopic ? 'locked' : 'active',
        progressPercent: 0,
        deletedAt: null,
      });
      mergedTopicId = mergedTopic._id;

      const idMap = new Map<string, Types.ObjectId>();
      for (const subtopic of claimed.subtopics ?? []) {
        const parentSubtopicId = subtopic.parentSourceId
          ? (idMap.get(subtopic.parentSourceId) ?? null)
          : null;
        const mergedSubtopic = await TrackerSubtopic.create({
          trackerId: sourceTrackerId,
          topicId: mergedTopicId,
          parentSubtopicId,
          title: subtopic.title,
          description: subtopic.description ?? '',
          order: subtopic.order,
          depth: subtopic.depth,
          isLocked: subtopic.isLocked ?? subtopic.depth > 1,
          learningVideo: subtopic.learningVideo ?? null,
          deletedAt: null,
        });
        idMap.set(subtopic.sourceId, mergedSubtopic._id);
        mergedSubtopicsCount += 1;
      }

      await Tracker.updateOne(
        { _id: sourceTrackerId, deletedAt: null },
        { $inc: { topicsCount: 1, subtopicsCount: mergedSubtopicsCount } }
      );
      countsIncremented = true;
      const approved = (await TrackerTopicContribution.findByIdAndUpdate(
        contributionId,
        {
          $set: {
            status: 'approved',
            reviewedAt: new Date(),
            mergedTopicId,
            reviewNote: input.reviewNote?.trim() || null,
          },
        },
        { returnDocument: 'after' }
      ).lean()) as ContributionLeanRecord | null;
      if (!approved) throw new Error('Approved contribution could not be reloaded');
      const requester = await this.findRequester(approved.requesterId);
      return {
        ok: true as const,
        contribution: this.toRecord(approved, requester),
        sourceTrackerTitle: source.title,
      };
    } catch (error) {
      if (mergedTopicId) {
        await Promise.all([
          TrackerSubtopic.deleteMany({ trackerId: sourceTrackerId, topicId: mergedTopicId }),
          TrackerTopic.deleteOne({ _id: mergedTopicId }),
        ]);
      }
      if (countsIncremented) {
        await Tracker.updateOne(
          { _id: sourceTrackerId, deletedAt: null },
          { $inc: { topicsCount: -1, subtopicsCount: -mergedSubtopicsCount } }
        );
      }
      await TrackerTopicContribution.updateOne(
        { _id: contributionId, status: 'processing' },
        { $set: { status: 'pending' } }
      );
      throw error;
    }
  }

  private async reviewFailure(contributionId: Types.ObjectId, sourceTrackerId: Types.ObjectId) {
    const existing = await TrackerTopicContribution.findOne({
      _id: contributionId,
      sourceTrackerId,
    })
      .select('status')
      .lean<{ status?: string }>();
    return existing
      ? { ok: false as const, reason: 'already-reviewed' as const }
      : { ok: false as const, reason: 'contribution-not-found' as const };
  }

  private async findRequester(id: unknown): Promise<RequesterRecord | null> {
    return (await User.findById(id)
      .select('_id fullName username avatarUrl')
      .lean()) as RequesterRecord | null;
  }

  private toRecord(
    value: ContributionLeanRecord,
    requester?: RequesterRecord | null
  ): TrackerTopicContributionRecord {
    const username = requester?.username?.trim() || `user-${String(value.requesterId).slice(-6)}`;
    return {
      id: String(value._id),
      sourceTrackerId: String(value.sourceTrackerId),
      cloneTrackerId: String(value.cloneTrackerId),
      cloneTopicId: String(value.cloneTopicId),
      requesterId: String(value.requesterId),
      ownerId: String(value.ownerId),
      requester: {
        name: requester?.fullName?.trim() || username,
        username,
        avatarUrl: requester?.avatarUrl ?? null,
      },
      title: value.title,
      description: value.description ?? '',
      subtopicsCount: value.subtopics?.length ?? 0,
      subtopics: (value.subtopics ?? []).map((subtopic) => ({
        title: subtopic.title,
        description: subtopic.description ?? '',
        depth: subtopic.depth,
        order: subtopic.order,
      })),
      status: value.status === 'processing' ? 'pending' : value.status,
      createdAt: value.createdAt,
      reviewedAt: value.reviewedAt ?? null,
      mergedTopicId: value.mergedTopicId ? String(value.mergedTopicId) : null,
      reviewNote: value.reviewNote ?? value.rejectionReason ?? null,
      rejectionReason: value.rejectionReason ?? null,
    };
  }

  private async getClanRole(
    trackerId: Types.ObjectId,
    trackerOwnerId: unknown,
    userId: Types.ObjectId
  ) {
    if (String(trackerOwnerId) === String(userId)) return 'owner' as const;
    const clan = await TrackerClan.findOne({ trackerId, 'members.userId': userId })
      .select('members')
      .lean<{ members?: Array<{ userId: unknown; role: 'co_owner' | 'member' }> }>();
    return (
      clan?.members?.find((member) => String(member.userId) === String(userId))?.role ?? 'outsider'
    );
  }

  private topicSignature(title: string, description?: string | null) {
    return `${title.trim().toLowerCase()}\u0000${(description ?? '').trim().toLowerCase()}`;
  }

  private isDuplicateKey(error: unknown): boolean {
    return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 11000);
  }
}

export const mongoTrackerTopicContributionRepository =
  new MongoTrackerTopicContributionRepository();
