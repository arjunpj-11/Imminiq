import { Notification } from '../../../../../infrastructure/database/models/notification.model';
import { AdminBroadcast } from '../../../../../infrastructure/database/models/admin-broadcast.model';
import { AdminBroadcastPollVote } from '../../../../../infrastructure/database/models/admin-broadcast-poll-vote.model';
import type { CreateNotificationInput, INotificationCommandRepository } from '../../../domain';
import { MongoNotificationsBaseRepository } from '../shared/mongo-notifications-base.repository';

export class MongoNotificationCommandRepository
  extends MongoNotificationsBaseRepository
  implements INotificationCommandRepository
{
  createNotification(input: CreateNotificationInput) {
    return this.execute('Failed to create notification', async () => {
      await Notification.create(input);
    });
  }
  markNotificationRead(userId: string, notificationId: string) {
    return this.execute('Failed to mark notification as read', async () =>
      Boolean(
        await Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true })
      )
    );
  }
  markAllNotificationsRead(userId: string) {
    return this.execute(
      'Failed to mark notifications as read',
      async () =>
        (await Notification.updateMany({ userId, isRead: false }, { isRead: true })).modifiedCount
    );
  }
  voteForPoll(userId: string, notificationId: string, optionIndex: number) {
    return this.execute('Failed to record poll vote', async () => {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId,
        type: 'admin_broadcast',
      }).lean();
      const metadata = notification?.metadata as { broadcastId?: string } | undefined;
      if (!metadata?.broadcastId) return { success: false, reason: 'NOT_FOUND' as const };

      const broadcast = await AdminBroadcast.findById(metadata.broadcastId).lean();
      if (!broadcast?.poll?.options?.[optionIndex]) {
        return { success: false, reason: 'INVALID_OPTION' as const };
      }

      await AdminBroadcastPollVote.findOneAndUpdate(
        { broadcastId: broadcast._id, userId },
        { $set: { optionIndex } },
        { upsert: true, new: true }
      );
      await Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true });

      return { success: true };
    });
  }
}
