import { Router } from "express";

import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { authenticatedApiIpLimiter } from "../../../shared/middlewares/security-rate-limit.middleware";
import { friendsController } from "./friends.controller";
import { FRIENDS_ROUTE_PATHS } from "./friends.route.constants";

const router = Router();

router.get(
  FRIENDS_ROUTE_PATHS.ROOT,
  authenticatedApiIpLimiter,
  authenticate,
  friendsController.listFriends,
);

router.get(
  FRIENDS_ROUTE_PATHS.SEARCH,
  authenticatedApiIpLimiter,
  authenticate,
  friendsController.searchUsers,
);

router.get(
  FRIENDS_ROUTE_PATHS.REQUESTS,
  authenticatedApiIpLimiter,
  authenticate,
  friendsController.listRequests,
);

router.post(
  FRIENDS_ROUTE_PATHS.REQUESTS,
  authenticatedApiIpLimiter,
  authenticate,
  friendsController.sendRequest,
);

router.post(
  FRIENDS_ROUTE_PATHS.ACCEPT_REQUEST,
  authenticatedApiIpLimiter,
  authenticate,
  friendsController.acceptRequest,
);

router.patch(
  FRIENDS_ROUTE_PATHS.DECLINE_REQUEST,
  authenticatedApiIpLimiter,
  authenticate,
  friendsController.declineRequest,
);

router.patch(
  FRIENDS_ROUTE_PATHS.CANCEL_REQUEST,
  authenticatedApiIpLimiter,
  authenticate,
  friendsController.cancelRequest,
);

router.delete(
  FRIENDS_ROUTE_PATHS.BY_FRIEND_USER_ID,
  authenticatedApiIpLimiter,
  authenticate,
  friendsController.removeFriend,
);

export default router;
export { router as friendsRoutes };
