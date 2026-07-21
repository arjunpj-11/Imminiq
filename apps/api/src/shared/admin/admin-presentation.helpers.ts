import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../utils/api-response';
import { adminOutputMapper } from './admin-output.mapper';
import type { AdminActor } from './admin.types';

export const getAdminActor = (req: Request): AdminActor => ({
  userId: req.user!.userId,
  role: req.user!.role as 'moderator' | 'admin' | 'superadmin',
  ipAddress: req.ip ?? '',
  userAgent: req.get('user-agent') ?? '',
});

export const sendAdminResult = <Result extends object>(
  next: NextFunction,
  task: () => Promise<Result>,
  res: Response,
  message: string
) =>
  task()
    .then((data) => res.json(new ApiResponse(message, adminOutputMapper.toResponseDTO(data))))
    .catch(next);
