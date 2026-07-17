import mongoose from 'mongoose';
import { AdminBroadcast } from '../../../../../infrastructure/database/models/admin-broadcast.model';
import { AdminBroadcastPollVote } from '../../../../../infrastructure/database/models/admin-broadcast-poll-vote.model';
import { AdminConsoleSettings } from '../../../../../infrastructure/database/models/admin-console-settings.model';
import { notificationQueue } from '../../../../../infrastructure/queue/queues';
import type { AdminActor, AdminListQuery } from '../../../shared/domain';
import { recordAdminAction } from '../../../shared/infrastructure';
import { createAdminPage, escapeAdminSearch } from '../../../shared/infrastructure';
import type { AdminBroadcastInput } from '../../domain/entities/admin-broadcast.entity';
import type { IAdminBroadcastRepository } from '../../domain/repositories/admin-broadcast.repository.interface';
export class MongoAdminBroadcastRepository implements IAdminBroadcastRepository {
  async list(query: AdminListQuery) {
    const filter: Record<string, unknown> = {};
    if (query.search)
      filter.$or = [
        { title: new RegExp(escapeAdminSearch(query.search), 'i') },
        { message: new RegExp(escapeAdminSearch(query.search), 'i') },
      ];
    const [rows, total, recipients] = await Promise.all([
      AdminBroadcast.find(filter)
        .sort({ sentAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .populate('sentBy', 'fullName username')
        .lean(),
      AdminBroadcast.countDocuments(filter),
      AdminBroadcast.aggregate<{ count: number }>([
        { $group: { _id: null, count: { $sum: '$recipientCount' } } },
      ]),
    ]);
    const items = await Promise.all(rows.map(async (row) => {
      const sender = row.sentBy as unknown as { fullName?: string; username?: string };
      const poll = row.poll?.question && row.poll.options?.length
        ? await this.getPollSummary(String(row._id), row.poll.question, row.poll.options)
        : undefined;
      return {
        id: String(row._id),
        title: row.title,
        message: row.message,
        audience: row.audience,
        deepLink: row.deepLink,
        sender: sender?.fullName ?? sender?.username ?? 'Admin',
        recipientCount: row.recipientCount,
        status: row.status,
        sentAt: row.sentAt,
        ...(poll ? { poll } : {}),
      };
    }));
    return createAdminPage(items, query, total, {
      sent: total,
      recipients: recipients[0]?.count ?? 0,
    });
  }
  async send(input: AdminBroadcastInput, actor: AdminActor) {
    const settings = await AdminConsoleSettings.findOne({ key: 'global' }).lean();
    if (settings?.allowBroadcasts === false) return null;
    const broadcast = await AdminBroadcast.create({
      ...input,
      sentBy: actor.userId,
      recipientCount: 0,
      status: 'queued',
      sentAt: new Date(),
    });
    try {
      await recordAdminAction(actor, 'admin_broadcast_requested', 'admin.broadcast', {
        broadcastId: String(broadcast._id),
        audience: input.audience,
      });
      await notificationQueue.add(
        'admin-broadcast',
        { kind: 'admin_broadcast', broadcastId: String(broadcast._id), input },
        {
          jobId: `admin-broadcast-${String(broadcast._id)}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        }
      );
    } catch (error) {
      await AdminBroadcast.updateOne({ _id: broadcast._id }, { $set: { status: 'failed' } });
      throw error;
    }
    return { id: String(broadcast._id), recipientCount: 0, status: 'queued' };
  }

  private async getPollSummary(broadcastId: string, question: string, options: string[]) {
    const votes = await AdminBroadcastPollVote.aggregate<{ _id: number; count: number }>([
      { $match: { broadcastId: new mongoose.Types.ObjectId(broadcastId) } },
      { $group: { _id: '$optionIndex', count: { $sum: 1 } } },
    ]);
    const totals = options.map((_, index) => votes.find((vote) => vote._id === index)?.count ?? 0);
    return { question, options, votes: totals, totalVotes: totals.reduce((sum, value) => sum + value, 0) };
  }
}
export const mongoAdminBroadcastRepository = new MongoAdminBroadcastRepository();
