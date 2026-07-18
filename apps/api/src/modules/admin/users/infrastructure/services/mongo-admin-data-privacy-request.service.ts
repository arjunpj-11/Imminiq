import mongoose from 'mongoose';
import { DataPrivacyRequest } from '../../../../../infrastructure/database/models/data-privacy-request.model';
import { ServiceError } from '../../../../../shared/errors/service.error';
import { recordAdminAction } from '../../../../../infrastructure/admin';
import type { AdminActor } from '../../../../../shared/admin';
import type {
  AdminPrivacyRequestListQuery,
  AdminPrivacyRequestUpdateInput,
  AdminPrivacyRequestUpdateResult,
  IAdminDataPrivacyRequestService,
} from '../../application/admin-data-privacy-request.service';

export class AdminDataPrivacyRequestService implements IAdminDataPrivacyRequestService {
  async list(query: AdminPrivacyRequestListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.status !== 'all') filter.status = query.status;
    if (query.type !== 'all') filter.type = query.type;
    if (query.search) {
      const users = await mongoose.model('User').find({
        $or: [
          { fullName: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
          { username: { $regex: query.search, $options: 'i' } },
        ],
      }).select('_id').lean();
      filter.userId = { $in: users.map((user) => user._id) };
    }
    const [rows, total, stats] = await Promise.all([
      DataPrivacyRequest.find(filter)
        .populate('userId', 'fullName username email phone')
        .populate('assignedTo', 'fullName username')
        .sort({ dueAt: 1, createdAt: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      DataPrivacyRequest.countDocuments(filter),
      DataPrivacyRequest.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    const counts = Object.fromEntries(stats.map((row) => [row._id, row.count]));
    return {
      items: rows.map((row) => {
        const user = row.userId as unknown as { _id: unknown; fullName?: string; username?: string; email?: string; phone?: string };
        const assignee = row.assignedTo as unknown as { fullName?: string; username?: string } | null;
        return {
          id: String(row._id), userId: String(user?._id ?? ''), userName: user?.fullName ?? 'Unknown user',
          identifier: user?.email ?? user?.phone ?? user?.username ?? '', type: row.type,
          details: row.details, status: row.status, assignedTo: assignee?.fullName ?? assignee?.username,
          resolutionNote: row.resolutionNote, downloadUrl: row.downloadUrl, dueAt: row.dueAt,
          completedAt: row.completedAt, createdAt: row.createdAt, updatedAt: row.updatedAt,
        };
      }),
      stats: {
        pending: counts.pending ?? 0,
        inProgress: counts.in_progress ?? 0,
        completed: counts.completed ?? 0,
        overdue: await DataPrivacyRequest.countDocuments({ status: { $in: ['pending', 'in_progress'] }, dueAt: { $lt: new Date() } }),
      },
      pagination: { page: query.page, limit: query.limit, total, pages: Math.max(1, Math.ceil(total / query.limit)) },
    };
  }

  async update(
    id: string,
    input: AdminPrivacyRequestUpdateInput,
    actor: AdminActor
  ) {
    const session = await mongoose.startSession();
    try {
      let result: AdminPrivacyRequestUpdateResult | undefined;
      await session.withTransaction(async () => {
        const row = await DataPrivacyRequest.findById(id).session(session);
        if (!row) throw new ServiceError('missing-resource', 'PRIVACY_REQUEST_NOT_FOUND', 'Privacy request not found');
        if (['completed', 'rejected', 'cancelled'].includes(row.status)) {
          throw new ServiceError('conflict', 'PRIVACY_REQUEST_FINAL', 'This request has already reached a final state');
        }
        row.status = input.status;
        row.assignedTo = new mongoose.Types.ObjectId(actor.userId);
        row.resolutionNote = input.resolutionNote;
        row.downloadUrl = input.downloadUrl ?? null;
        row.completedAt = ['completed', 'rejected'].includes(input.status) ? new Date() : null;
        await row.save({ session });
        await recordAdminAction(actor, 'privacy_request.updated', 'users', {
          requestId: id, userId: String(row.userId), status: input.status, type: row.type,
        }, session);
        result = { id: String(row._id), status: row.status, updatedAt: row.updatedAt };
      });
      if (!result) {
        throw new ServiceError(
          'internal',
          'PRIVACY_REQUEST_UPDATE_FAILED',
          'Privacy request update did not produce a result'
        );
      }
      return result;
    } finally { await session.endSession(); }
  }
}
