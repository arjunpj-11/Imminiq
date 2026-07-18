import { Worker } from 'bullmq';
import { Types } from 'mongoose';
import { redis } from '../../cache/redis.client';
import { AdminBroadcast } from '../../database/models/admin-broadcast.model';
import { Notification } from '../../database/models/notification.model';
import { Subscription } from '../../database/models/subscription.model';
import { UserSettings } from '../../database/models/user-settings.model';
import { User } from '../../database/models/user.model';
import type { AdminBroadcastInput } from '../../../modules/admin/broadcast';
import { emitNotificationCreated } from '../../realtime/socket';

type AdminBroadcastJob = {
  kind: 'admin_broadcast';
  broadcastId: string;
  input: AdminBroadcastInput;
};

const recipientFilter = async (input: AdminBroadcastInput) => {
  const filter: Record<string, unknown> = { deletedAt: null, status: 'active' };
  if (input.audience === 'active') filter.lastActiveAt = { $gte: new Date(Date.now() - 30 * 86400000) };
  if (input.audience === 'custom') filter._id = { $in: input.userIds ?? [] };
  if (input.audience === 'pro' || input.audience === 'premium') {
    filter._id = { $in: await Subscription.distinct('userId', {
      planId: input.audience,
      status: 'active',
      $or: [{ endsAt: null }, { endsAt: { $gt: new Date() } }],
    }) };
  }
  if (input.audience === 'free') {
    filter._id = { $nin: await Subscription.distinct('userId', {
      status: 'active',
      $or: [{ endsAt: null }, { endsAt: { $gt: new Date() } }],
    }) };
  }
  return filter;
};

export const notificationWorker = new Worker<AdminBroadcastJob>(
  'notification',
  async (job) => {
    const { broadcastId, input } = job.data;
    const claimed = await AdminBroadcast.findOneAndUpdate(
      { _id: broadcastId, status: { $in: ['queued', 'processing', 'failed'] } },
      { $set: { status: 'processing' } },
      { new: true }
    );
    if (!claimed) return;

    let recipientCount = 0;
    try {
      const cursor = User.find(await recipientFilter(input)).select('_id').lean().cursor({ batchSize: 500 });
      let batch: Types.ObjectId[] = [];
      const flush = async () => {
        if (!batch.length) return;
        const optedOut = new Set((await UserSettings.distinct('userId', {
          userId: { $in: batch },
          $or: [
            { 'notifications.globalEnabled': false },
            { 'notifications.types.adminBroadcasts': false },
          ],
        })).map(String));
        const recipients = batch.filter((id) => !optedOut.has(String(id)));
        if (recipients.length) {
          await Notification.bulkWrite(recipients.map((userId) => ({
            updateOne: {
              filter: { userId, type: 'admin_broadcast', 'metadata.broadcastId': broadcastId },
              update: { $setOnInsert: {
                userId,
                type: 'admin_broadcast',
                message: `${input.title}: ${input.message}`,
                isRead: false,
                deepLink: input.deepLink || undefined,
                metadata: {
                  title: input.title,
                  audience: input.audience,
                  broadcastId,
                  ...(input.poll ? { poll: input.poll } : {}),
                },
              } },
              upsert: true,
            },
          })), { ordered: false });
          for (const userId of recipients) {
            emitNotificationCreated(String(userId), 'admin_broadcast');
          }
          recipientCount += recipients.length;
        }
        batch = [];
      };
      for await (const user of cursor) {
        batch.push(user._id);
        if (batch.length >= 500) await flush();
      }
      await flush();
      await AdminBroadcast.updateOne(
        { _id: broadcastId },
        { $set: { status: 'sent', recipientCount, sentAt: new Date() } }
      );
    } catch (error) {
      await AdminBroadcast.updateOne({ _id: broadcastId }, { $set: { status: 'failed' } });
      throw error;
    }
  },
  { connection: redis, concurrency: 2 }
);

export const startNotificationWorker = async () => notificationWorker.waitUntilReady();
