import { AdminBroadcast } from '../../../../../infrastructure/database/models/admin-broadcast.model';
import { AdminConsoleSettings } from '../../../../../infrastructure/database/models/admin-console-settings.model';
import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import { UserSettings } from '../../../../../infrastructure/database/models/user-settings.model';
import { User } from '../../../../../infrastructure/database/models/user.model';
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
    const items = rows.map((row) => {
      const sender = row.sentBy as unknown as { fullName?: string; username?: string };
      return {
        id: String(row._id),
        title: row.title,
        message: row.message,
        audience: row.audience,
        sender: sender?.fullName ?? sender?.username ?? 'Admin',
        recipientCount: row.recipientCount,
        status: row.status,
        sentAt: row.sentAt,
      };
    });
    return createAdminPage(items, query, total, {
      sent: total,
      recipients: recipients[0]?.count ?? 0,
    });
  }
  async send(input: AdminBroadcastInput, actor: AdminActor) {
    const settings = await AdminConsoleSettings.findOne({ key: 'global' }).lean();
    if (settings?.allowBroadcasts === false)
      return null;
    const since = new Date(Date.now() - 30 * 86400000);
    const userFilter: Record<string, unknown> = {
      deletedAt: null,
      status: 'active',
      $or: [{ emailVerified: true }, { phoneVerified: true }],
    };
    if (input.audience === 'active') userFilter.lastActiveAt = { $gte: since };
    const [users, optedOut] = await Promise.all([
      User.find(userFilter).select('_id').lean(),
      UserSettings.distinct('userId', { 'notifications.types.adminBroadcasts': false }),
    ]);
    const optedOutIds = new Set(optedOut.map(String));
    const recipients = users.filter((user) => !optedOutIds.has(String(user._id)));
    if (recipients.length)
      await Notification.insertMany(
        recipients.map((user) => ({
          userId: user._id,
          type: 'admin_broadcast',
          message: `${input.title}: ${input.message}`,
          isRead: false,
          deepLink: input.deepLink || undefined,
          metadata: { title: input.title, audience: input.audience },
        })),
        { ordered: false }
      );
    const broadcast = await AdminBroadcast.create({
      ...input,
      sentBy: actor.userId,
      recipientCount: recipients.length,
      status: 'sent',
      sentAt: new Date(),
    });
    await recordAdminAction(actor, 'admin_broadcast_sent', 'admin.broadcast', {
      broadcastId: String(broadcast._id),
      recipientCount: recipients.length,
      audience: input.audience,
    });
    return { id: String(broadcast._id), recipientCount: recipients.length, status: 'sent' };
  }
}
export const mongoAdminBroadcastRepository = new MongoAdminBroadcastRepository();
