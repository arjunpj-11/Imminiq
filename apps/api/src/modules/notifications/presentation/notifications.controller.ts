import type { NextFunction, Request, Response } from 'express';
import type { NotificationsUseCases } from '../application';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../shared/utils/getAuthUser';
import { notificationsListQuerySchema } from './notifications.schema';
import { Notification } from '../../../infrastructure/database/models/notification.model';
import { AdminBroadcast } from '../../../infrastructure/database/models/admin-broadcast.model';
import { AdminBroadcastPollVote } from '../../../infrastructure/database/models/admin-broadcast-poll-vote.model';

export class NotificationsController {
  constructor(private readonly _useCases: NotificationsUseCases) {}
  listNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = notificationsListQuerySchema.parse(req.query);
      const data = await this._useCases.listNotifications.execute(getAuthUser(req).userId, payload);
      res.json(new ApiResponse('Notifications fetched', data));
    } catch (error) {
      next(error);
    }
  };
  markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.markNotificationRead.execute(
        getAuthUser(req).userId,
        String(req.params.notificationId)
      );
      res.json(new ApiResponse('Notification marked as read', data));
    } catch (error) {
      next(error);
    }
  };
  markAllNotificationsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this._useCases.markAllNotificationsRead.execute(getAuthUser(req).userId);
      res.json(new ApiResponse('Notifications marked as read', data));
    } catch (error) {
      next(error);
    }
  };
  voteForPoll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getAuthUser(req).userId;
      const notification = await Notification.findOne({
        _id: req.params.notificationId,
        userId,
        type: 'admin_broadcast',
      }).lean();
      const metadata = notification?.metadata as { broadcastId?: string } | undefined;
      if (!metadata?.broadcastId) return res.status(404).json(new ApiResponse('Poll not found', null));
      const broadcast = await AdminBroadcast.findById(metadata.broadcastId).lean();
      const optionIndex = Number(req.body.optionIndex);
      if (!broadcast?.poll?.options?.[optionIndex]) return res.status(400).json(new ApiResponse('Invalid poll option', null));
      await AdminBroadcastPollVote.findOneAndUpdate(
        { broadcastId: broadcast._id, userId },
        { $set: { optionIndex } },
        { upsert: true, new: true }
      );
      await this._useCases.markNotificationRead.execute(userId, String(req.params.notificationId));
      res.json(new ApiResponse('Poll vote recorded', { optionIndex }));
    } catch (error) {
      next(error);
    }
  };
}
