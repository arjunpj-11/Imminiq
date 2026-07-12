import type { NextFunction, Request, Response } from 'express'
import { ApiResponse } from '../../../shared/utils/ApiResponse'
import { getAuthUser } from '../../../shared/utils/getAuthUser'
import type { createNotificationsComposition } from '../notifications.factory'

type UseCases = ReturnType<typeof createNotificationsComposition>['useCases']

export class NotificationsController {
  constructor(private readonly useCases: UseCases) {}
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.useCases.list.execute(getAuthUser(req).userId, Number(req.query.page) || 1, Number(req.query.limit) || 20)
      res.json(new ApiResponse('Notifications fetched', data))
    } catch (error) { next(error) }
  }
  markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.useCases.markRead.execute(getAuthUser(req).userId, String(req.params.notificationId))
      res.json(new ApiResponse('Notification marked as read', { updated }))
    } catch (error) { next(error) }
  }
  markAllRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.useCases.markAllRead.execute(getAuthUser(req).userId)
      res.json(new ApiResponse('Notifications marked as read', { updated }))
    } catch (error) { next(error) }
  }
}
