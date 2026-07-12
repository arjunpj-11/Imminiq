import type { NextFunction, Request, Response } from "express";

import { HttpStatusCode } from "../../../shared/constants/http-status-code.enum";
import { FRIENDS_RESPONSE_MESSAGES } from "../application/constants/friends.constants";
import { ApiError } from "../../../shared/utils/ApiError";
import { ApiResponse } from "../../../shared/utils/ApiResponse";
import { getAuthUser } from "../../../shared/utils/getAuthUser";
import type { FriendsUseCases } from "../application/contracts/friends-use-cases.contract";
import {
  friendParamsSchema,
  friendRequestParamsSchema,
  listFriendRequestsQuerySchema,
  listFriendsQuerySchema,
  searchUsersQuerySchema,
  sendFriendRequestSchema,
} from "./friends.schema";

export class FriendsController {
  constructor(private readonly _useCases: FriendsUseCases) {}

  listFriends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = this.parseOrThrow(
        listFriendsQuerySchema.safeParse(req.query),
        "Friends query is invalid",
      );
      const user = getAuthUser(req);
      const result = await this._useCases.listFriends.execute(user.userId, {
        page: query.page,
        limit: query.limit,
        ...(query.q !== undefined ? { search: query.q } : {}),
      });

      res.json(new ApiResponse(FRIENDS_RESPONSE_MESSAGES.LISTED, result));
    } catch (error) {
      next(error);
    }
  };

  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = this.parseOrThrow(
        searchUsersQuerySchema.safeParse(req.query),
        "People search query is invalid",
      );
      const user = getAuthUser(req);
      const result = await this._useCases.searchUsers.execute(user.userId, {
        query: query.q,
        page: query.page,
        limit: query.limit,
      });

      res.json(new ApiResponse(FRIENDS_RESPONSE_MESSAGES.SEARCHED, result));
    } catch (error) {
      next(error);
    }
  };

  listRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = this.parseOrThrow(
        listFriendRequestsQuerySchema.safeParse(req.query),
        "Friend request query is invalid",
      );
      const user = getAuthUser(req);
      const result = await this._useCases.listFriendRequests.execute(user.userId, query);

      res.json(
        new ApiResponse(FRIENDS_RESPONSE_MESSAGES.REQUESTS_LISTED, result),
      );
    } catch (error) {
      next(error);
    }
  };

  sendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = this.parseOrThrow(
        sendFriendRequestSchema.safeParse(req.body),
        "Friend invite is invalid",
      );
      const user = getAuthUser(req);
      const result = await this._useCases.sendFriendRequest.execute(user.userId, {
        receiverUserId: body.receiverUserId,
        ...(body.message !== undefined ? { message: body.message } : {}),
      });

      res
        .status(result.created ? HttpStatusCode.CREATED : HttpStatusCode.OK)
        .json(
          new ApiResponse(
            result.created
              ? FRIENDS_RESPONSE_MESSAGES.REQUEST_SENT
              : "Friend invite already pending",
            result,
          ),
        );
    } catch (error) {
      next(error);
    }
  };

  acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parseOrThrow(
        friendRequestParamsSchema.safeParse(req.params),
        "Friend request identifier is invalid",
      );
      const user = getAuthUser(req);
      const result = await this._useCases.acceptFriendRequest.execute(
        user.userId,
        params,
      );

      res.json(
        new ApiResponse(FRIENDS_RESPONSE_MESSAGES.REQUEST_ACCEPTED, result),
      );
    } catch (error) {
      next(error);
    }
  };

  declineRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parseOrThrow(
        friendRequestParamsSchema.safeParse(req.params),
        "Friend request identifier is invalid",
      );
      const user = getAuthUser(req);
      const result = await this._useCases.declineFriendRequest.execute(
        user.userId,
        params,
      );

      res.json(
        new ApiResponse(FRIENDS_RESPONSE_MESSAGES.REQUEST_DECLINED, result),
      );
    } catch (error) {
      next(error);
    }
  };

  cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parseOrThrow(
        friendRequestParamsSchema.safeParse(req.params),
        "Friend request identifier is invalid",
      );
      const user = getAuthUser(req);
      const result = await this._useCases.cancelFriendRequest.execute(
        user.userId,
        params,
      );

      res.json(
        new ApiResponse(FRIENDS_RESPONSE_MESSAGES.REQUEST_CANCELLED, result),
      );
    } catch (error) {
      next(error);
    }
  };

  removeFriend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = this.parseOrThrow(
        friendParamsSchema.safeParse(req.params),
        "Friend identifier is invalid",
      );
      const user = getAuthUser(req);
      const result = await this._useCases.removeFriend.execute(user.userId, params);

      res.json(
        new ApiResponse(FRIENDS_RESPONSE_MESSAGES.FRIEND_REMOVED, result),
      );
    } catch (error) {
      next(error);
    }
  };

  private parseOrThrow<T>(
    result:
      | { success: true; data: T }
      | {
          success: false;
          error: {
            issues: Array<{ message: string }>;
          };
        },
    fallbackMessage: string,
  ): T {
    if (result.success) {
      return result.data;
    }

    throw new ApiError(
      HttpStatusCode.BAD_REQUEST,
      result.error.issues[0]?.message ?? fallbackMessage,
      "VALIDATION_ERROR",
    );
  }
}
