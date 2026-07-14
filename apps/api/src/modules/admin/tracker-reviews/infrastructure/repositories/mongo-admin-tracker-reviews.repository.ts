import { CommunityVerificationSubmission } from '../../../../../infrastructure/database/models/community-verification-submission.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import type { AdminActor, AdminListQuery } from '../../../shared/domain';
import { recordAdminAction } from '../../../shared/infrastructure';
import { createAdminPage, escapeAdminSearch } from '../../../shared/infrastructure';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';
import type { AdminTrackerReviewConsensusChoice } from '../../domain/entities/admin-tracker-review.entity';
export class MongoAdminTrackerReviewsRepository implements IAdminTrackerReviewsRepository {
  async list(query: AdminListQuery) {
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.search)
      filter.$or = [
        { title: new RegExp(escapeAdminSearch(query.search), 'i') },
        { category: new RegExp(escapeAdminSearch(query.search), 'i') },
      ];
    const [rows, total, open, approved, rejected] = await Promise.all([
      CommunityVerificationSubmission.find(filter)
        .sort({ urgent: -1, createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('ownerId', 'fullName username')
        .lean(),
      CommunityVerificationSubmission.countDocuments(filter),
      CommunityVerificationSubmission.countDocuments({ deletedAt: null, status: 'open' }),
      CommunityVerificationSubmission.countDocuments({ deletedAt: null, status: 'approved' }),
      CommunityVerificationSubmission.countDocuments({ deletedAt: null, status: 'rejected' }),
    ]);
    const items = rows.map((row) => {
      const owner = row.ownerId as unknown as { fullName?: string; username?: string };
      return {
        id: String(row._id),
        trackerId: String(row.trackerId),
        title: row.title,
        owner: owner?.fullName ?? owner?.username ?? 'Unknown',
        category: row.category,
        status: row.status,
        urgent: row.urgent,
        passVotes: row.passVotes,
        failVotes: row.failVotes,
        createdAt: row.createdAt,
      };
    });
    return createAdminPage(items, query, total, { open, approved, rejected });
  }
  async addConsensusVote(
    id: string,
    choice: AdminTrackerReviewConsensusChoice,
    actor: AdminActor
  ) {
    const voteField = choice === 'pass' ? 'passVotes' : 'failVotes';
    const review = await CommunityVerificationSubmission.findOneAndUpdate(
      { _id: id, deletedAt: null, status: 'open' },
      { $inc: { [voteField]: 1 } },
      { returnDocument: "after" }
    ).lean();
    if (!review) {
      const exists = await CommunityVerificationSubmission.exists({ _id: id, deletedAt: null });
      if (!exists) return { kind: 'not_found' as const };
      return { kind: 'not_open' as const };
    }
    const progress = Math.min(
      100,
      Math.round(((review.passVotes + review.failVotes) / review.requiredVotes) * 100)
    );
    await CommunityVerificationSubmission.updateOne({ _id: id }, { $set: { progress } });
    await recordAdminAction(actor, 'admin_tracker_review_consensus_vote_added', 'admin.tracker-reviews', {
      reviewId: id,
      trackerId: String(review.trackerId),
      choice,
      passVotes: review.passVotes,
      failVotes: review.failVotes,
    });
    return {
      kind: 'success' as const,
      value: { id, passVotes: review.passVotes, failVotes: review.failVotes },
    };
  }
  async resolve(id: string, status: string, actor: AdminActor) {
    const review = await CommunityVerificationSubmission.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { status, consensusChoice: status === 'approved' ? 'pass' : 'fail' } },
      { returnDocument: "after" }
    ).lean();
    if (!review) return null;
    await Tracker.updateOne(
      { _id: review.trackerId },
      {
        $set: {
          verificationStatus: status === 'approved' ? 'verified' : 'rejected',
          verifiedAt: status === 'approved' ? new Date() : null,
        },
      }
    );
    await recordAdminAction(actor, 'admin_tracker_review_resolved', 'admin.tracker-reviews', {
      reviewId: id,
      status,
      trackerId: String(review.trackerId),
    });
    return { id, status: review.status };
  }
}
export const mongoAdminTrackerReviewsRepository = new MongoAdminTrackerReviewsRepository();
