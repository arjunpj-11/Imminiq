import mongoose from 'mongoose';
import { CommunityVerificationSubmission } from '../../../../../infrastructure/database/models/community-verification-submission.model';
import { Tracker } from '../../../../../infrastructure/database/models/tracker.model';
import type { AdminActor, AdminListQuery } from '../../../../../shared/admin';
import {
  createAdminPage,
  escapeAdminSearch,
  recordAdminAction,
} from '../../../../../infrastructure/admin';
import type { AdminTrackerReviewConsensusChoice } from '../../domain/entities/admin-tracker-review.entity';
import type { IAdminTrackerReviewsRepository } from '../../domain/repositories/admin-tracker-reviews.repository.interface';

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

  async addConsensusVote(id: string, choice: AdminTrackerReviewConsensusChoice, actor: AdminActor) {
    const session = await mongoose.startSession();
    try {
      let response:
        | { kind: 'success'; value: { id: string; passVotes: number; failVotes: number } }
        | { kind: 'not_open' }
        | { kind: 'not_found' } = { kind: 'not_found' };
      await session.withTransaction(async () => {
        const review = await CommunityVerificationSubmission.findOne({
          _id: id,
          deletedAt: null,
        }).session(session);
        if (!review) return;
        if (review.status !== 'open') {
          response = { kind: 'not_open' };
          return;
        }
        const existing = review.adminVotes.find(
          (vote: { userId: unknown }) => String(vote.userId) === actor.userId
        );
        if (existing?.choice === choice) {
          response = {
            kind: 'success',
            value: { id, passVotes: review.passVotes, failVotes: review.failVotes },
          };
          return;
        }
        if (existing) {
          if (existing.choice === 'pass') review.passVotes = Math.max(0, review.passVotes - 1);
          else review.failVotes = Math.max(0, review.failVotes - 1);
          existing.choice = choice;
          existing.votedAt = new Date();
        } else {
          review.adminVotes.push({
            userId: new mongoose.Types.ObjectId(actor.userId),
            choice,
            votedAt: new Date(),
          });
        }
        if (choice === 'pass') review.passVotes += 1;
        else review.failVotes += 1;
        review.progress = Math.min(
          100,
          Math.round(((review.passVotes + review.failVotes) / review.requiredVotes) * 100)
        );
        await review.save({ session });
        await recordAdminAction(
          actor,
          existing
            ? 'admin_tracker_review_consensus_vote_changed'
            : 'admin_tracker_review_consensus_vote_added',
          'admin.trackers',
          {
            reviewId: id,
            trackerId: String(review.trackerId),
            choice,
            passVotes: review.passVotes,
            failVotes: review.failVotes,
          },
          session
        );
        response = {
          kind: 'success',
          value: { id, passVotes: review.passVotes, failVotes: review.failVotes },
        };
      });
      return response;
    } finally {
      await session.endSession();
    }
  }

  async resolve(id: string, status: string, actor: AdminActor) {
    const session = await mongoose.startSession();
    try {
      let result:
        | {
            id: string;
            status: string;
            rewardContext: {
              submissionId: string;
              consensusChoice: 'pass' | 'fail';
              trackerId: string;
              ownerId: string;
              trackerTitle: string;
            };
          }
        | null = null;
      await session.withTransaction(async () => {
        const review = await CommunityVerificationSubmission.findOne({
          _id: id,
          deletedAt: null,
        }).session(session);
        if (!review) return;

        const consensusChoice = status === 'approved' ? 'pass' : 'fail';
        const rewardContext = {
          submissionId: String(review._id),
          consensusChoice,
          trackerId: String(review.trackerId),
          ownerId: String(review.ownerId),
          trackerTitle: review.title,
        } as const;

        /*
         * A reward write can fail after the moderation decision commits.
         * Returning the same resolution on retry lets the idempotent reward
         * service finish without reopening or double-paying the review.
         */
        if (review.status !== 'open') {
          if (review.status === status && review.consensusChoice === consensusChoice) {
            result = { id, status: review.status, rewardContext };
          }
          return;
        }

        review.status = status as 'approved' | 'rejected';
        review.consensusChoice = consensusChoice;
        review.progress = 100;
        await review.save({ session });

        await Tracker.updateOne(
          { _id: review.trackerId },
          {
            $set: {
              verificationStatus: status === 'approved' ? 'verified' : 'rejected',
              verifiedAt: status === 'approved' ? new Date() : null,
            },
          },
          { session }
        );
        await recordAdminAction(
          actor,
          'admin_tracker_review_resolved',
          'admin.trackers',
          { reviewId: id, status, trackerId: String(review.trackerId) },
          session
        );
        result = { id, status: review.status, rewardContext };
      });
      return result;
    } finally {
      await session.endSession();
    }
  }
}

export const mongoAdminTrackerReviewsRepository = new MongoAdminTrackerReviewsRepository();
