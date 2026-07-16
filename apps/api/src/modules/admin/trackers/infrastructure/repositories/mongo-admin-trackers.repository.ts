import mongoose from 'mongoose';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import { TrackerTopic } from '../../../../../infrastructure/database/models/tracker-topic.model';
import { TrackerSubtopic } from '../../../../../infrastructure/database/models/tracker-subtopic.model';
import { CommunityTrackerLike } from '../../../../../infrastructure/database/models/community-tracker-like.model';
import { CommunityTrackerReview } from '../../../../../infrastructure/database/models/community-tracker-review.model';
import { TrackerReport } from '../../../../../infrastructure/database/models/tracker-report.model';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import { recordAdminAction } from '../../../shared/infrastructure';
import { createAdminPage, escapeAdminSearch } from '../../../shared/infrastructure';
import type { AdminActor, AdminListQuery } from '../../../shared/domain';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type {
  AdminTrackerLifecycleInput,
  AdminTrackerLifecycleResult,
  AdminTrackerReportUpdateInput,
} from '../../domain/entities/admin-tracker.entity';
export class MongoAdminTrackersRepository implements IAdminTrackersRepository {
  async list(query: AdminListQuery) {
    const filter: Record<string, unknown> =
      query.status === 'deleted' ? { moderationStatus: 'deleted' } : { deletedAt: null };
    if (query.status && query.status !== 'all') {
      if (query.status === 'suspended') filter.moderationStatus = 'suspended';
      else if (query.status !== 'deleted') {
        filter.status = query.status;
        filter.moderationStatus = { $in: ['active', null] };
      }
    }
    if (query.search)
      filter.$or = [
        { title: new RegExp(escapeAdminSearch(query.search), 'i') },
        { category: new RegExp(escapeAdminSearch(query.search), 'i') },
      ];
    const [rows, total, active, draft, archived, reports] = await Promise.all([
      Tracker.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('ownerId', 'fullName username')
        .lean(),
      Tracker.countDocuments(filter),
      Tracker.countDocuments({
        deletedAt: null,
        status: 'active',
        moderationStatus: { $in: ['active', null] },
      }),
      Tracker.countDocuments({ deletedAt: null, status: 'draft' }),
      Tracker.countDocuments({ deletedAt: null, status: 'archived' }),
      TrackerReport.aggregate<{ _id: unknown; reportCount: number; openReportCount: number }>([
        {
          $group: {
            _id: '$trackerId',
            reportCount: { $sum: 1 },
            openReportCount: {
              $sum: { $cond: [{ $in: ['$status', ['open', 'reviewing']] }, 1, 0] },
            },
          },
        },
      ]),
    ]);
    const reportsByTracker = new Map(reports.map((item) => [String(item._id), item] as const));
    const items = rows.map((row) => {
      const owner = row.ownerId as unknown as { fullName?: string; username?: string };
      const reportStats = reportsByTracker.get(String(row._id));
      return {
        id: String(row._id),
        title: row.title,
        owner: owner?.fullName ?? owner?.username ?? 'Unknown',
        category: row.category,
        level: row.level,
        visibility: row.visibility,
        status: row.status,
        moderationStatus: (row.moderationStatus ?? 'active') as 'active' | 'suspended' | 'deleted',
        ...(row.moderationReason ? { moderationReason: row.moderationReason } : {}),
        verificationStatus: row.verificationStatus ?? null,
        topicsCount: row.topicsCount,
        cloneCount: row.cloneCount,
        createdAt: row.createdAt,
        reportCount: reportStats?.reportCount ?? 0,
        openReportCount: reportStats?.openReportCount ?? 0,
      };
    });
    return createAdminPage(items, query, total, {
      total: await Tracker.countDocuments({}),
      active,
      draft,
      archived,
      suspended: await Tracker.countDocuments({ moderationStatus: 'suspended', deletedAt: null }),
      openReports: reports.reduce((sum, item) => sum + item.openReportCount, 0),
    });
  }
  async listPublished(query: AdminListQuery, actor: AdminActor) {
    const filter: Record<string, unknown> = {
      deletedAt: null,
      visibility: 'public',
      publishedAt: { $ne: null },
      moderationStatus: { $in: ['active', null] },
    };
    if (query.search) {
      filter.$or = [
        { title: new RegExp(escapeAdminSearch(query.search), 'i') },
        { category: new RegExp(escapeAdminSearch(query.search), 'i') },
      ];
    }
    const [rows, total, totals] = await Promise.all([
      Tracker.find(filter)
        .sort({ publishedAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('ownerId', 'fullName username')
        .lean(),
      Tracker.countDocuments(filter),
      Tracker.aggregate<{ _id: null; likes: number; ratings: number }>([
        { $match: filter },
        { $group: { _id: null, likes: { $sum: '$likeCount' }, ratings: { $sum: '$ratingCount' } } },
      ]),
    ]);
    const trackerIds = rows.map((row) => row._id);
    const [likes, ratings] = await Promise.all([
      CommunityTrackerLike.find({
        trackerId: { $in: trackerIds },
        userId: actor.userId,
        deletedAt: null,
      })
        .select('trackerId')
        .lean(),
      CommunityTrackerReview.find({
        trackerId: { $in: trackerIds },
        userId: actor.userId,
        deletedAt: null,
      })
        .select('trackerId rating')
        .lean(),
    ]);
    const likedIds = new Set(likes.map((like) => String(like.trackerId)));
    const ratingById = new Map(ratings.map((rating) => [String(rating.trackerId), rating.rating]));
    const items = rows.map((row) => {
      const owner = row.ownerId as unknown as { fullName?: string; username?: string };
      return {
        id: String(row._id),
        title: row.title,
        owner: owner?.fullName ?? owner?.username ?? 'Unknown',
        category: row.category,
        level: row.level,
        topicsCount: row.topicsCount,
        cloneCount: row.cloneCount,
        likeCount: row.likeCount,
        ratingAverage: row.ratingAverage,
        ratingCount: row.ratingCount,
        publishedAt: row.publishedAt!,
        adminLiked: likedIds.has(String(row._id)),
        adminRating: ratingById.get(String(row._id)) ?? null,
      };
    });
    return createAdminPage(items, query, total, {
      published: total,
      likes: totals[0]?.likes ?? 0,
      ratings: totals[0]?.ratings ?? 0,
    });
  }
  async likePublished(id: string, actor: AdminActor) {
    if (!(await this.isPublishedTracker(id))) return null;
    await CommunityTrackerLike.findOneAndUpdate(
      { trackerId: id, userId: actor.userId, deletedAt: null },
      { $set: { deletedAt: null } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    const likeCount = await CommunityTrackerLike.countDocuments({ trackerId: id, deletedAt: null });
    await Tracker.updateOne({ _id: id }, { $set: { likeCount } });
    await recordAdminAction(actor, 'admin_published_tracker_liked', 'admin.trackers', {
      targetType: 'tracker',
      targetId: id,
      likeCount,
    });
    return this.getPublishedEngagement(id, actor, { likeCount });
  }
  async ratePublished(id: string, rating: number, actor: AdminActor) {
    if (!(await this.isPublishedTracker(id))) return null;
    await CommunityTrackerReview.findOneAndUpdate(
      { trackerId: id, userId: actor.userId, deletedAt: null },
      {
        $set: {
          rating,
          comment: 'Rating submitted by Imminiq administration.',
          deletedAt: null,
        },
        $setOnInsert: { helpfulUserIds: [], helpfulCount: 0 },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    const summary = await CommunityTrackerReview.aggregate<{
      _id: null;
      ratingAverage: number;
      ratingCount: number;
    }>([
      { $match: { trackerId: new mongoose.Types.ObjectId(id), deletedAt: null } },
      { $group: { _id: null, ratingAverage: { $avg: '$rating' }, ratingCount: { $sum: 1 } } },
    ]);
    const ratingAverage = Number((summary[0]?.ratingAverage ?? 0).toFixed(2));
    const ratingCount = summary[0]?.ratingCount ?? 0;
    await Tracker.updateOne({ _id: id }, { $set: { ratingAverage, ratingCount } });
    await recordAdminAction(actor, 'admin_published_tracker_rated', 'admin.trackers', {
      targetType: 'tracker',
      targetId: id,
      rating,
      ratingAverage,
      ratingCount,
    });
    return this.getPublishedEngagement(id, actor, { ratingAverage, ratingCount });
  }
  async getDetail(id: string) {
    const tracker = await Tracker.findById(id)
      .populate('ownerId', 'fullName username email')
      .lean();
    if (!tracker) return null;
    const [topics, subtopics, reportCount, openReportCount] = await Promise.all([
      TrackerTopic.find({ trackerId: id, deletedAt: null }).sort({ order: 1 }).lean(),
      TrackerSubtopic.find({ trackerId: id, deletedAt: null })
        .sort({ topicId: 1, order: 1 })
        .lean(),
      TrackerReport.countDocuments({ trackerId: id }),
      TrackerReport.countDocuments({ trackerId: id, status: { $in: ['open', 'reviewing'] } }),
    ]);
    const owner = tracker.ownerId as unknown as {
      _id?: unknown;
      fullName?: string;
      username?: string;
      email?: string;
    };
    return {
      id: String(tracker._id),
      title: tracker.title,
      description: tracker.description,
      owner: owner?.fullName ?? owner?.username ?? 'Unknown',
      ownerId: String(owner?._id ?? ''),
      ...(owner?.email ? { ownerEmail: owner.email } : {}),
      category: tracker.category,
      level: tracker.level,
      visibility: tracker.visibility,
      status: tracker.status,
      moderationStatus: (tracker.moderationStatus ?? 'active') as 'active' | 'suspended' | 'deleted',
      ...(tracker.moderationReason ? { moderationReason: tracker.moderationReason } : {}),
      verificationStatus: tracker.verificationStatus ?? null,
      topicsCount: tracker.topicsCount,
      cloneCount: tracker.cloneCount,
      createdAt: tracker.createdAt,
      reportCount,
      openReportCount,
      topics: topics.map((topic) => ({
        id: String(topic._id),
        title: topic.title,
        description: topic.description,
        order: topic.order,
        status: topic.status,
        estimatedHours: topic.estimatedHours,
        subtopics: subtopics
          .filter((subtopic) => String(subtopic.topicId) === String(topic._id))
          .map((subtopic) => ({
            id: String(subtopic._id),
            title: subtopic.title,
            description: subtopic.description,
            order: subtopic.order,
            depth: subtopic.depth,
            parentSubtopicId: subtopic.parentSubtopicId ? String(subtopic.parentSubtopicId) : null,
            estimatedMinutes: subtopic.estimatedMinutes,
          })),
      })),
    };
  }
  async listReports(query: AdminListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.search) filter.details = new RegExp(escapeAdminSearch(query.search), 'i');
    const [rows, total, open, reviewing, resolved, dismissed] = await Promise.all([
      TrackerReport.find(filter)
        .sort({ createdAt: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('trackerId', 'title ownerId')
        .populate('reporterId', 'fullName username email')
        .populate('assignedTo', 'fullName username')
        .lean(),
      TrackerReport.countDocuments(filter),
      TrackerReport.countDocuments({ status: 'open' }),
      TrackerReport.countDocuments({ status: 'reviewing' }),
      TrackerReport.countDocuments({ status: 'resolved' }),
      TrackerReport.countDocuments({ status: 'dismissed' }),
    ]);
    const ownerIds = rows
      .map((row) => (row.trackerId as unknown as { ownerId?: unknown })?.ownerId)
      .filter(Boolean);
    const owners = await User.find({ _id: { $in: ownerIds } }).select('fullName username').lean();
    const ownerById = new Map(
      owners.map((owner) => [String(owner._id), owner.fullName ?? owner.username ?? 'Unknown'])
    );
    const items = rows.map((row) => {
      const tracker = row.trackerId as unknown as { _id?: unknown; title?: string; ownerId?: unknown };
      const reporter = row.reporterId as unknown as { _id?: unknown; fullName?: string; username?: string; email?: string };
      const assigned = row.assignedTo as unknown as { fullName?: string; username?: string } | null;
      return {
        id: String(row._id),
        trackerId: String(tracker?._id ?? ''),
        trackerTitle: tracker?.title ?? 'Deleted tracker',
        trackerOwner: ownerById.get(String(tracker?.ownerId ?? '')) ?? 'Unknown',
        reporterId: String(reporter?._id ?? ''),
        reporter: reporter?.fullName ?? reporter?.username ?? 'Unknown',
        ...(reporter?.email ? { reporterEmail: reporter.email } : {}),
        reason: row.reason,
        details: row.details,
        status: row.status as 'open' | 'reviewing' | 'resolved' | 'dismissed',
        resolutionAction: row.resolutionAction,
        resolutionNote: row.resolutionNote,
        ...(assigned ? { assignedTo: assigned.fullName ?? assigned.username ?? 'Unknown' } : {}),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        ...(row.resolvedAt ? { resolvedAt: row.resolvedAt } : {}),
      };
    });
    return createAdminPage(items, query, total, { open, reviewing, resolved, dismissed });
  }

  async updateReport(id: string, input: AdminTrackerReportUpdateInput, actor: AdminActor) {
    const report = await TrackerReport.findByIdAndUpdate(
      id,
      {
        $set: {
          status: input.status,
          assignedTo: input.status === 'reviewing' ? actor.userId : null,
          resolutionAction: 'none',
          resolutionNote: input.resolutionNote,
          resolvedBy: input.status === 'reviewing' ? null : actor.userId,
          resolvedAt: input.status === 'reviewing' ? null : new Date(),
        },
      },
      { returnDocument: 'after' }
    ).lean();
    if (!report) return null;
    await Promise.all([
      Notification.create({
        userId: report.reporterId,
        type: 'tracker_report_updated',
        message:
          input.status === 'reviewing'
            ? 'Your tracker report is now being reviewed.'
            : `Your tracker report was ${input.status}. ${input.resolutionNote}`.slice(0, 500),
        deepLink: '/community',
        metadata: { reportId: id, status: input.status },
      }),
      recordAdminAction(actor, 'admin_tracker_report_updated', 'admin.trackers', {
        targetType: 'tracker_report',
        targetId: id,
        status: input.status,
        resolutionAction: 'none',
        resolutionNote: input.resolutionNote,
      }),
    ]);
    const [tracker, reporter, assigned] = await Promise.all([
      Tracker.findById(report.trackerId).select('title ownerId').populate('ownerId', 'fullName username').lean(),
      User.findById(report.reporterId).select('fullName username email').lean(),
      report.assignedTo
        ? User.findById(report.assignedTo).select('fullName username').lean()
        : Promise.resolve(null),
    ]);
    const owner = tracker?.ownerId as unknown as { fullName?: string; username?: string } | undefined;
    return {
      id: String(report._id),
      trackerId: String(report.trackerId),
      trackerTitle: tracker?.title ?? 'Deleted tracker',
      trackerOwner: owner?.fullName ?? owner?.username ?? 'Unknown',
      reporterId: String(report.reporterId),
      reporter: reporter?.fullName ?? reporter?.username ?? 'Unknown',
      ...(reporter?.email ? { reporterEmail: reporter.email } : {}),
      reason: report.reason,
      details: report.details,
      status: report.status as 'open' | 'reviewing' | 'resolved' | 'dismissed',
      resolutionAction: report.resolutionAction,
      resolutionNote: report.resolutionNote,
      ...(assigned ? { assignedTo: assigned.fullName ?? assigned.username ?? 'Unknown' } : {}),
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      ...(report.resolvedAt ? { resolvedAt: report.resolvedAt } : {}),
    };
  }

  async updateLifecycle(id: string, input: AdminTrackerLifecycleInput, actor: AdminActor) {
    const tracker = await Tracker.findById(id).populate('ownerId', 'fullName username email').lean();
    if (!tracker) return null;
    const owner = tracker.ownerId as unknown as { _id?: unknown; fullName?: string; username?: string; email?: string };
    const now = new Date();
    const moderationStatus: AdminTrackerLifecycleResult['moderationStatus'] =
      input.action === 'restore' ? 'active' : input.action === 'suspend' ? 'suspended' : 'deleted';
    const affectedReporterIds =
      input.action === 'restore'
        ? []
        : await TrackerReport.distinct('reporterId', {
            trackerId: id,
            status: { $in: ['open', 'reviewing'] },
          });
    const update =
      input.action === 'restore'
        ? {
            moderationStatus,
            moderatedBy: actor.userId,
            suspendedAt: null,
            deletedAt: null,
          }
        : {
            moderationStatus,
            moderationReason: input.reason,
            moderationReasonCode: input.reasonCode,
            moderatedBy: actor.userId,
            suspendedAt: now,
            deletedAt: input.action === 'delete' ? now : null,
            visibility: 'private',
            publishedAt: null,
            allowClone: false,
          };
    await Tracker.updateOne(
      { _id: id },
      input.action === 'restore'
        ? { $set: update, $unset: { moderationReason: 1, moderationReasonCode: 1 } }
        : { $set: update }
    );
    if (input.action !== 'restore') {
      await TrackerReport.updateMany(
        { trackerId: id, status: { $in: ['open', 'reviewing'] } },
        {
          $set: {
            status: 'resolved',
            resolutionAction: input.action === 'delete' ? 'tracker_deleted' : 'tracker_suspended',
            resolutionNote: input.reason,
            resolvedBy: actor.userId,
            resolvedAt: now,
            assignedTo: null,
          },
        }
      );
      if (affectedReporterIds.length) {
        await Notification.insertMany(
          affectedReporterIds.map((reporterId) => ({
            userId: reporterId,
            type: 'tracker_report_resolved',
            message: `A tracker you reported was ${moderationStatus}. The moderation note was: ${input.reason}`.slice(
              0,
              500
            ),
            deepLink: '/community',
            metadata: {
              trackerId: id,
              moderationStatus,
              reasonCode: input.reasonCode,
            },
          }))
        );
      }
    }
    await Promise.all([
      ...(owner?._id
        ? [
            Notification.create({
              userId: new mongoose.Types.ObjectId(String(owner._id)),
              type: 'tracker_moderation_updated',
              message:
                input.action === 'restore'
                  ? `Your tracker “${tracker.title}” was restored.`
                  : `Your tracker “${tracker.title}” was ${moderationStatus}. Reason: ${input.reason}`.slice(
                      0,
                      500
                    ),
              deepLink: '/trackers',
              metadata: { trackerId: id, moderationStatus, reasonCode: input.reasonCode },
            }),
          ]
        : []),
      recordAdminAction(actor, `admin_tracker_${input.action}d`, 'admin.trackers', {
        targetType: 'tracker',
        targetId: id,
        targetTitle: tracker.title,
        reasonCode: input.reasonCode,
        reason: input.reason,
        previousStatus: tracker.moderationStatus ?? 'active',
        moderationStatus,
      }),
    ]);
    return {
      id,
      title: tracker.title,
      owner: owner?.fullName ?? owner?.username ?? 'Unknown',
      ...(owner?.email ? { ownerEmail: owner.email } : {}),
      moderationStatus,
      reason: input.reason,
      updatedAt: now,
    };
  }
  private async isPublishedTracker(id: string) {
    const tracker = await Tracker.exists({
      _id: id,
      deletedAt: null,
      visibility: 'public',
      publishedAt: { $ne: null },
      moderationStatus: { $in: ['active', null] },
    });
    return Boolean(tracker);
  }
  private async getPublishedEngagement(
    id: string,
    actor: AdminActor,
    overrides: Partial<{ likeCount: number; ratingAverage: number; ratingCount: number }> = {}
  ) {
    const [tracker, like, review] = await Promise.all([
      Tracker.findById(id).select('likeCount ratingAverage ratingCount').lean(),
      CommunityTrackerLike.exists({ trackerId: id, userId: actor.userId, deletedAt: null }),
      CommunityTrackerReview.findOne({ trackerId: id, userId: actor.userId, deletedAt: null })
        .select('rating')
        .lean(),
    ]);
    return {
      id,
      likeCount: overrides.likeCount ?? tracker?.likeCount ?? 0,
      ratingAverage: overrides.ratingAverage ?? tracker?.ratingAverage ?? 0,
      ratingCount: overrides.ratingCount ?? tracker?.ratingCount ?? 0,
      adminLiked: Boolean(like),
      adminRating: review?.rating ?? null,
    };
  }
}
export const mongoAdminTrackersRepository = new MongoAdminTrackersRepository();
