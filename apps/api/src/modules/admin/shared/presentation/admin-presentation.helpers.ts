import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import type { AdminActor } from '../domain/admin-shared.types';

export const getAdminActor = (req: Request): AdminActor => ({
  userId: req.user!.userId,
  role: req.user!.role as 'admin' | 'superadmin',
  ipAddress: req.ip ?? '',
  userAgent: req.get('user-agent') ?? '',
});

export const sendAdminResult = (
  next: NextFunction,
  task: () => Promise<object>,
  res: Response,
  message: string
) =>
  task()
    .then((data) => res.json(new ApiResponse(message, data)))
    .catch(next);
