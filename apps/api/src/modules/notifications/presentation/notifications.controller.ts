import type { NextFunction, Request, Response } from 'express';
import type { NotificationsUseCases } from '../application';
import { ApiResponse } from '../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../shared/utils/getAuthUser';
import { notificationsListQuerySchema } from './notifications.schema';

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
}
