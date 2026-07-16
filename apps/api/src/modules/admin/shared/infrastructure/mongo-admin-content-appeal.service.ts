import mongoose from 'mongoose';
import { ContentModerationAppeal } from '../../../../infrastructure/database/models/content-moderation-appeal.model';
import { MockTestModel } from '../../../../infrastructure/database/models/mock-test.model';
import { Tracker } from '../../../../infrastructure/database/models/tracker.model';
import { ServiceError } from '../../../../shared/errors/service.error';
import type { AdminActor } from '../domain/admin-shared.types';
import { recordAdminAction } from '../infrastructure/admin-audit.helper';

export interface IAdminContentAppealService {
  list(targetType: 'tracker' | 'mock_test', query: { status: string; page: number; limit: number }): Promise<object>;
  update(targetType: 'tracker' | 'mock_test', id: string, input: { status: 'under_review' | 'approved' | 'rejected'; decisionNote: string }, actor: AdminActor): Promise<object>;
}

export class AdminContentAppealService implements IAdminContentAppealService {
  async list(targetType: 'tracker' | 'mock_test', query: { status: string; page: number; limit: number }) {
    const filter: Record<string, unknown> = { targetType, deletedAt: null };
    if (query.status !== 'all') filter.status = query.status;
    const [rows, total, stats] = await Promise.all([
      ContentModerationAppeal.find(filter).populate('ownerId', 'fullName username email').populate('assignedTo', 'fullName username').sort({ createdAt: 1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
      ContentModerationAppeal.countDocuments(filter),
      ContentModerationAppeal.aggregate<{ _id: string; count: number }>([{ $match: { targetType, deletedAt: null } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    const targetIds = rows.map((row) => row.targetId);
    const targets = targetType === 'tracker'
      ? await Tracker.find({ _id: { $in: targetIds } }).select('title moderationStatus').lean()
      : await MockTestModel.find({ _id: { $in: targetIds } }).select('title moderationStatus').lean();
    const targetMap = new Map(targets.map((target) => [String(target._id), target]));
    const counts = Object.fromEntries(stats.map((row) => [row._id, row.count]));
    return {
      items: rows.map((row) => {
        const owner = row.ownerId as unknown as { _id: unknown; fullName?: string; username?: string; email?: string };
        const assignee = row.assignedTo as unknown as { fullName?: string; username?: string } | null;
        const target = targetMap.get(String(row.targetId));
        return { id: String(row._id), targetId: String(row.targetId), targetType, title: target?.title ?? 'Removed content', moderationStatus: target?.moderationStatus ?? 'deleted', ownerId: String(owner?._id ?? ''), ownerName: owner?.fullName ?? owner?.username ?? 'Unknown owner', ownerEmail: owner?.email, reason: row.reason, evidenceUrls: row.evidenceUrls, status: row.status, assignedTo: assignee?.fullName ?? assignee?.username, decisionNote: row.decisionNote, createdAt: row.createdAt, updatedAt: row.updatedAt };
      }),
      stats: { pending: counts.pending ?? 0, underReview: counts.under_review ?? 0, approved: counts.approved ?? 0, rejected: counts.rejected ?? 0 },
      pagination: { page: query.page, limit: query.limit, total, pages: Math.max(1, Math.ceil(total / query.limit)) },
    };
  }

  async update(targetType: 'tracker' | 'mock_test', id: string, input: { status: 'under_review' | 'approved' | 'rejected'; decisionNote: string }, actor: AdminActor) {
    const session = await mongoose.startSession();
    try {
      let result: object = {};
      await session.withTransaction(async () => {
        const row = await ContentModerationAppeal.findOne({ _id: id, targetType, deletedAt: null }).session(session);
        if (!row) throw new ServiceError('missing-resource', 'CONTENT_APPEAL_NOT_FOUND', 'Content appeal not found');
        if (['approved', 'rejected'].includes(row.status)) throw new ServiceError('conflict', 'CONTENT_APPEAL_FINAL', 'Appeal is already decided');
        row.status = input.status;
        row.assignedTo = new mongoose.Types.ObjectId(actor.userId);
        row.decisionNote = input.decisionNote;
        row.decidedBy = ['approved', 'rejected'].includes(input.status) ? new mongoose.Types.ObjectId(actor.userId) : null;
        row.decidedAt = ['approved', 'rejected'].includes(input.status) ? new Date() : null;
        await row.save({ session });
        if (input.status === 'approved') {
          const Model = targetType === 'tracker' ? Tracker : MockTestModel;
          await Model.updateOne(
            { _id: row.targetId },
            {
              $set: {
                moderationStatus: 'active',
                moderationReason: null,
                moderationReasonCode: null,
                moderatedBy: actor.userId,
                suspendedAt: null,
                deletedAt: null,
              },
            },
            { session }
          );
        }
        await recordAdminAction(actor, 'content_appeal.updated', targetType === 'tracker' ? 'trackers' : 'mock-tests', { appealId: id, targetId: String(row.targetId), status: input.status }, session);
        result = { id, status: row.status, targetId: String(row.targetId), updatedAt: row.updatedAt };
      });
      return result;
    } finally { await session.endSession(); }
  }
}
