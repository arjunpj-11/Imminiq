import type { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../../shared/constants/http-status-code.enum';
import { ApiError } from '../../../../shared/utils/ApiError';
import { ApiResponse } from '../../../../shared/utils/ApiResponse';
import { getAuthUser } from '../../../../shared/utils/getAuthUser';
import type { LeaderboardUseCases } from '../application/leaderboard-use-cases.contract';
import { leaderboardQuerySchema } from './leaderboard.schema';

export class LeaderboardController {
  constructor(private readonly _useCases: LeaderboardUseCases) {}

  getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedQuery = leaderboardQuerySchema.safeParse(req.query);

      if (!parsedQuery.success) {
        throw new ApiError(
          HttpStatusCode.BAD_REQUEST,
          parsedQuery.error.issues[0]?.message ?? 'Leaderboard query is invalid',
          'VALIDATION_ERROR'
        );
      }

      const user = getAuthUser(req);
      const leaderboard = await this._useCases.getLeaderboard.execute(
        user.userId,
        parsedQuery.data
      );

      res.json(new ApiResponse('Leaderboard fetched', leaderboard));
    } catch (error) {
      next(error);
    }
  };

  getRewards = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rewards = this._useCases.getRewards.execute();

      res.json(new ApiResponse('Leaderboard rewards fetched', rewards));
    } catch (error) {
      next(error);
    }
  };
}
