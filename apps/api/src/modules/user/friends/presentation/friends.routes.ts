import { Router } from 'express';

import { authenticate } from '../../../../shared/middlewares/auth.middleware';
import { authenticatedApiUserLimiter } from '../../../../shared/middlewares/security-rate-limit.middleware';
import { FriendsController } from './friends.controller';
import type { FriendsUseCases } from '../application/friends-use-cases.contract';
import { FRIENDS_ROUTE_PATHS } from './friends.route.constants';

export const createFriendsRoutes = (useCases: FriendsUseCases) => {
  const friendsController = new FriendsController(useCases);
  const router = Router();

  router.get(
    FRIENDS_ROUTE_PATHS.ROOT,
    authenticate,
    authenticatedApiUserLimiter,
    friendsController.listFriends
  );

  router.get(
    FRIENDS_ROUTE_PATHS.SEARCH,
    authenticate,
    authenticatedApiUserLimiter,
    friendsController.searchUsers
  );

  router.get(
    FRIENDS_ROUTE_PATHS.REQUESTS,
    authenticate,
    authenticatedApiUserLimiter,
    friendsController.listRequests
  );

  router.post(
    FRIENDS_ROUTE_PATHS.REQUESTS,
    authenticate,
    authenticatedApiUserLimiter,
    friendsController.sendRequest
  );

  router.post(
    FRIENDS_ROUTE_PATHS.ACCEPT_REQUEST,
    authenticate,
    authenticatedApiUserLimiter,
    friendsController.acceptRequest
  );

  router.patch(
    FRIENDS_ROUTE_PATHS.DECLINE_REQUEST,
    authenticate,
    authenticatedApiUserLimiter,
    friendsController.declineRequest
  );

  router.patch(
    FRIENDS_ROUTE_PATHS.CANCEL_REQUEST,
    authenticate,
    authenticatedApiUserLimiter,
    friendsController.cancelRequest
  );

  router.delete(
    FRIENDS_ROUTE_PATHS.BY_FRIEND_USER_ID,
    authenticate,
    authenticatedApiUserLimiter,
    friendsController.removeFriend
  );

  return router;
};
