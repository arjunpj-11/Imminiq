import mongoose from 'mongoose';
import { AdminBroadcast } from '../../../../../infrastructure/database/models/admin-broadcast.model';
import { AdminBroadcastPollVote } from '../../../../../infrastructure/database/models/admin-broadcast-poll-vote.model';
import { AdminConsoleSettings } from '../../../../../infrastructure/database/models/admin-console-settings.model';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import { UserSettings } from '../../../../../infrastructure/database/models/user-settings.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
import { Subscription } from '../../../../../infrastructure/database/models/subscription.model';
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
    const since = new Date(Date.now() - 30 * 86400000);
    const userFilter: Record<string, unknown> = {
      deletedAt: null,
      status: 'active',
    };
    if (input.audience === 'active') userFilter.lastActiveAt = { $gte: since };
    if (input.audience === 'custom') userFilter._id = { $in: input.userIds ?? [] };
    if (input.audience === 'pro' || input.audience === 'premium') {
      userFilter._id = {
        $in: await Subscription.distinct('userId', {
          planId: input.audience,
          status: 'active',
          $or: [{ endsAt: null }, { endsAt: { $gt: new Date() } }],
        }),
      };
    }
    if (input.audience === 'free') {
      userFilter._id = {
        $nin: await Subscription.distinct('userId', {
          status: 'active',
          $or: [{ endsAt: null }, { endsAt: { $gt: new Date() } }],
        }),
      };
    }
    const [users, optedOut] = await Promise.all([
      User.find(userFilter).select('_id').lean(),
      UserSettings.distinct('userId', {
        $or: [
          { 'notifications.globalEnabled': false },
          { 'notifications.types.adminBroadcasts': false },
        ],
      }),
    ]);
    const optedOutIds = new Set(optedOut.map(String));
    const recipients = users.filter((user) => !optedOutIds.has(String(user._id)));
    const broadcast = await AdminBroadcast.create({
      ...input,
      sentBy: actor.userId,
      recipientCount: recipients.length,
      status: 'sent',
      sentAt: new Date(),
    });
    if (recipients.length)
      await Notification.insertMany(
        recipients.map((user) => ({
          userId: user._id,
          type: 'admin_broadcast',
          message: `${input.title}: ${input.message}`,
          isRead: false,
          deepLink: input.deepLink || undefined,
          metadata: {
            title: input.title,
            audience: input.audience,
            broadcastId: String(broadcast._id),
            ...(input.poll ? { poll: input.poll } : {}),
          },
        })),
        { ordered: false }
      );
    await recordAdminAction(actor, 'admin_broadcast_sent', 'admin.broadcast', {
      broadcastId: String(broadcast._id),
      recipientCount: recipients.length,
      audience: input.audience,
    });
    return { id: String(broadcast._id), recipientCount: recipients.length, status: 'sent' };
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
