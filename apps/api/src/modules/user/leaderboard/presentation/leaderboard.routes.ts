import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import { LeaderboardController } from './leaderboard.controller';
import type { LeaderboardUseCases } from '../application/leaderboard-use-cases.contract';
import { LEADERBOARD_ROUTE_PATHS } from './leaderboard.route.constants';

export const createLeaderboardRoutes = (useCases: LeaderboardUseCases) => {
  const leaderboardController = new LeaderboardController(useCases);
  const router = Router();

  router.get(
    LEADERBOARD_ROUTE_PATHS.ROOT,
    authenticate,
    authenticatedApiUserLimiter,
    leaderboardController.getLeaderboard
  );

  router.get(
    LEADERBOARD_ROUTE_PATHS.REWARDS,
    authenticate,
    authenticatedApiUserLimiter,
    leaderboardController.getRewards
  );

  return router;
};
