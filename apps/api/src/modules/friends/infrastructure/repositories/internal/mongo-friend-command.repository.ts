import mongoose from "mongoose";

import { Friend } from "../../../../../infrastructure/database/models/friend.model";
import { FriendRequest } from "../../../../../infrastructure/database/models/friend-request.model";
import { User } from "../../../../../infrastructure/database/models/user.model";
import { UserProfile } from "../../../../../infrastructure/database/models/user-profile.model";
import type { FriendCommandRepositoryContract } from "../../../domain/repositories/friend-command.repository.interface";
import type {
  AcceptFriendRequestCommandResult,
  ChangeFriendRequestCommandResult,
  FriendRequestActionCommandInput,
  RemoveFriendCommandInput,
  RemoveFriendCommandResult,
  SendFriendRequestCommandInput,
  SendFriendRequestCommandResult,
} from "../../../domain/types/friends.types";
import { MongoFriendsBaseRepository } from "../shared/mongo-friends-base.repository";
import { MongoFriendsErrorMapper } from "../shared/mongo-friends-error.mapper";
import { MongoFriendsMapper } from "../shared/mongo-friends.mapper";
import { MongoFriendsNormalizer } from "../shared/mongo-friends-normalizer";
import type { MongoFriendRequestRecord } from "../shared/mongo-friends.types";
import { MongoFriendNotificationProvisioner } from "./mongo-friend-notification.provisioner";
import { MongoLeaderboardAudienceSynchronizer } from "./mongo-leaderboard-audience.synchronizer";

export class MongoFriendCommandRepository
  extends MongoFriendsBaseRepository
  implements FriendCommandRepositoryContract
{
  constructor(
    private readonly _mapper = new MongoFriendsMapper(),
    private readonly _notificationProvisioner = new MongoFriendNotificationProvisioner(),
    private readonly _leaderboardAudienceSynchronizer = new MongoLeaderboardAudienceSynchronizer(),
  ) {
    super();
  }

  async sendFriendRequest(
    input: SendFriendRequestCommandInput,
  ): Promise<SendFriendRequestCommandResult> {
    return this.execute(
      "FRIEND_REQUEST_WRITE_FAILED",
      "Failed to send friend request",
      async () => {
        const senderUserId = MongoFriendsNormalizer.toObjectId(
          input.senderUserId,
          "INVALID_SENDER_USER_ID",
        );

        const receiverUserId = MongoFriendsNormalizer.toObjectId(
          input.receiverUserId,
          "INVALID_RECEIVER_USER_ID",
        );

        const pairKey = MongoFriendsNormalizer.pairKey(
          senderUserId,
          receiverUserId,
        );

        const session = await mongoose.startSession();

        let result: SendFriendRequestCommandResult | null = null;

        try {
          await session.withTransaction(async () => {
            /*
             * Do not use Promise.all() for operations sharing this
             * transaction session. MongoDB transaction operations
             * must run sequentially.
             */
            const sender = await User.findOne({
              _id: senderUserId,
              status: "active",
              deletedAt: null,
            })
              .select({
                _id: 1,
                fullName: 1,
              })
              .session(session)
              .lean<{
                _id: mongoose.Types.ObjectId;
                fullName: string;
              }>();

            const receiver = await User.findOne({
              _id: receiverUserId,
              status: "active",
              deletedAt: null,
              role: {
                $nin: ["admin", "superadmin"],
              },
            })
              .select({
                _id: 1,
                fullName: 1,
              })
              .session(session)
              .lean<{
                _id: mongoose.Types.ObjectId;
                fullName: string;
              }>();

           const receiverProfile = await UserProfile.findOne({
  userId: receiverUserId,
  deletedAt: null,
})
  .select({
    publicProfileEnabled: 1,
  })
  .session(session)
  .lean<{
    publicProfileEnabled?: boolean;
  }>();

console.log("Friend request availability", {
  senderUserId: senderUserId.toString(),
  receiverUserId: receiverUserId.toString(),
  senderFound: Boolean(sender),
  receiverFound: Boolean(receiver),
  receiverProfileFound: Boolean(receiverProfile),
  publicProfileEnabled:
    receiverProfile?.publicProfileEnabled,
});

if (
  !sender ||
  !receiver ||
  receiverProfile?.publicProfileEnabled === false
) {
  result = {
    outcome: "target_unavailable",
  };

  return;
}

            const friendshipExists = await Friend.exists({
              userId: senderUserId,
              friendId: receiverUserId,
              status: "active",
              deletedAt: null,
            }).session(session);

            if (friendshipExists) {
              result = {
                outcome: "already_friends",
              };

              return;
            }

            const existingRequest = await FriendRequest.findOne({
              pairKey,
              status: "pending",
              deletedAt: null,
            })
              .session(session)
              .lean<MongoFriendRequestRecord>();

            if (existingRequest) {
              const existingEntity =
                this._mapper.toFriendRequestEntityOrThrow(existingRequest);

              result =
                existingRequest.senderId.toString() === senderUserId.toString()
                  ? {
                      outcome: "already_pending",
                      request: existingEntity,
                    }
                  : {
                      outcome: "reverse_pending",
                      request: existingEntity,
                    };

              return;
            }

            const createdRequests = await FriendRequest.create(
              [
                {
                  senderId: senderUserId,
                  receiverId: receiverUserId,
                  pairKey,
                  status: "pending",
                  message: input.message,
                  deletedAt: null,
                },
              ],
              {
                session,
              },
            );

            const createdRequest = createdRequests[0];

            if (!createdRequest) {
              throw new Error(
                "Friend request creation returned no document",
              );
            }

            await this._notificationProvisioner.createFriendRequestReceived(
              {
                receiverUserId,
                senderUserId,
                senderName: sender.fullName,
                requestId: createdRequest._id,
              },
              session,
            );

            result = {
              outcome: "created",
              request: this._mapper.toFriendRequestEntityOrThrow(
                this._mapper.toPlainRecord<MongoFriendRequestRecord>(
                  createdRequest,
                ),
              ),
            };
          });
        } finally {
          await session.endSession();
        }

        if (!result) {
          throw new Error(
            "Friend request transaction produced no result",
          );
        }

        return result;
      },
      MongoFriendsErrorMapper.mapDuplicateRelationshipError,
    );
  }

  async acceptFriendRequest(
    input: FriendRequestActionCommandInput,
  ): Promise<AcceptFriendRequestCommandResult> {
    return this.execute(
      "FRIEND_REQUEST_ACCEPT_FAILED",
      "Failed to accept friend request",
      async () => {
        const requestId = MongoFriendsNormalizer.toObjectId(
          input.requestId,
          "INVALID_FRIEND_REQUEST_ID",
        );

        const receiverUserId = MongoFriendsNormalizer.toObjectId(
          input.actorUserId,
          "INVALID_RECEIVER_USER_ID",
        );

        const session = await mongoose.startSession();

        let result: AcceptFriendRequestCommandResult | null = null;

        try {
          await session.withTransaction(async () => {
            const request = await FriendRequest.findOne({
              _id: requestId,
              deletedAt: null,
            })
              .session(session)
              .lean<MongoFriendRequestRecord>();

            if (!request) {
              result = {
                outcome: "not_found",
              };

              return;
            }

            if (
              request.receiverId.toString() !== receiverUserId.toString()
            ) {
              result = {
                outcome: "forbidden",
              };

              return;
            }

            const senderUserId = MongoFriendsNormalizer.toObjectId(
              request.senderId.toString(),
              "INVALID_SENDER_USER_ID",
            );

            if (request.status === "accepted") {
              result = {
                outcome: "already_accepted",
                friendUserId: senderUserId.toString(),
              };

              return;
            }

            if (request.status !== "pending") {
              result = {
                outcome: "not_pending",
              };

              return;
            }

            const sender = await User.findOne({
              _id: senderUserId,
              status: "active",
              deletedAt: null,
            })
              .select({
                _id: 1,
                fullName: 1,
              })
              .session(session)
              .lean<{
                _id: mongoose.Types.ObjectId;
                fullName: string;
              }>();

            const receiver = await User.findOne({
              _id: receiverUserId,
              status: "active",
              deletedAt: null,
            })
              .select({
                _id: 1,
                fullName: 1,
              })
              .session(session)
              .lean<{
                _id: mongoose.Types.ObjectId;
                fullName: string;
              }>();

            if (!sender || !receiver) {
              result = {
                outcome: "target_unavailable",
              };

              return;
            }

            const requestWriteResult = await FriendRequest.updateOne(
              {
                _id: requestId,
                status: "pending",
                deletedAt: null,
              },
              {
                $set: {
                  status: "accepted",
                },
              },
              {
                session,
              },
            );

            if (requestWriteResult.modifiedCount !== 1) {
              result = {
                outcome: "not_pending",
              };

              return;
            }

            /*
             * These two operations must run sequentially because
             * they share the same MongoDB transaction session.
             */
            await this.restoreFriendship(
              receiverUserId,
              senderUserId,
              session,
            );

            await this.restoreFriendship(
              senderUserId,
              receiverUserId,
              session,
            );

            await this._leaderboardAudienceSynchronizer.addFriendship(
              receiverUserId,
              senderUserId,
              session,
            );

            await this._notificationProvisioner.createFriendRequestAccepted(
              {
                senderUserId,
                receiverUserId,
                receiverName: receiver.fullName,
                requestId,
              },
              session,
            );

            result = {
              outcome: "accepted",
              friendUserId: senderUserId.toString(),
            };
          });
        } finally {
          await session.endSession();
        }

        if (!result) {
          throw new Error(
            "Accept friend request transaction produced no result",
          );
        }

        return result;
      },
      MongoFriendsErrorMapper.mapDuplicateRelationshipError,
    );
  }

  declineFriendRequest(
    input: FriendRequestActionCommandInput,
  ): Promise<ChangeFriendRequestCommandResult> {
    return this.changeRequestStatus(
      input,
      "receiver",
      "rejected",
      "FRIEND_REQUEST_DECLINE_FAILED",
      "Failed to decline friend request",
    );
  }

  cancelFriendRequest(
    input: FriendRequestActionCommandInput,
  ): Promise<ChangeFriendRequestCommandResult> {
    return this.changeRequestStatus(
      input,
      "sender",
      "cancelled",
      "FRIEND_REQUEST_CANCEL_FAILED",
      "Failed to cancel friend request",
    );
  }

  async removeFriend(
    input: RemoveFriendCommandInput,
  ): Promise<RemoveFriendCommandResult> {
    return this.execute(
      "FRIEND_REMOVE_FAILED",
      "Failed to remove friend",
      async () => {
        const userId = MongoFriendsNormalizer.toObjectId(
          input.userId,
          "INVALID_USER_ID",
        );

        const friendUserId = MongoFriendsNormalizer.toObjectId(
          input.friendUserId,
          "INVALID_FRIEND_USER_ID",
        );

        const session = await mongoose.startSession();

        let result: RemoveFriendCommandResult | null = null;

        try {
          await session.withTransaction(async () => {
            const now = new Date();

            const writeResult = await Friend.updateMany(
              {
                $or: [
                  {
                    userId,
                    friendId: friendUserId,
                  },
                  {
                    userId: friendUserId,
                    friendId: userId,
                  },
                ],
                status: "active",
                deletedAt: null,
              },
              {
                $set: {
                  deletedAt: now,
                },
              },
              {
                session,
              },
            );

            if (writeResult.modifiedCount === 0) {
              result = {
                outcome: "not_friends",
              };

              return;
            }

            await this._leaderboardAudienceSynchronizer.removeFriendship(
              userId,
              friendUserId,
              session,
            );

            result = {
              outcome: "removed",
            };
          });
        } finally {
          await session.endSession();
        }

        if (!result) {
          throw new Error(
            "Remove friend transaction produced no result",
          );
        }

        return result;
      },
    );
  }

  private async changeRequestStatus(
    input: FriendRequestActionCommandInput,
    owner: "sender" | "receiver",
    nextStatus: "rejected" | "cancelled",
    errorCode: string,
    errorMessage: string,
  ): Promise<ChangeFriendRequestCommandResult> {
    return this.execute(errorCode, errorMessage, async () => {
      const requestId = MongoFriendsNormalizer.toObjectId(
        input.requestId,
        "INVALID_FRIEND_REQUEST_ID",
      );

      const actorUserId = MongoFriendsNormalizer.toObjectId(
        input.actorUserId,
        "INVALID_FRIEND_REQUEST_ACTOR_ID",
      );

      const request = await FriendRequest.findOne({
        _id: requestId,
        deletedAt: null,
      }).lean<MongoFriendRequestRecord>();

      if (!request) {
        return {
          outcome: "not_found",
        };
      }

      const expectedOwnerId =
        owner === "sender"
          ? request.senderId.toString()
          : request.receiverId.toString();

      if (expectedOwnerId !== actorUserId.toString()) {
        return {
          outcome: "forbidden",
        };
      }

      if (request.status === nextStatus) {
        return {
          outcome: "already_changed",
        };
      }

      if (request.status !== "pending") {
        return {
          outcome: "not_pending",
        };
      }

      const writeResult = await FriendRequest.updateOne(
        {
          _id: requestId,
          status: "pending",
          deletedAt: null,
        },
        {
          $set: {
            status: nextStatus,
          },
        },
      );

      return writeResult.modifiedCount === 1
        ? {
            outcome: "changed",
          }
        : {
            outcome: "not_pending",
          };
    });
  }

  private async restoreFriendship(
    userId: mongoose.Types.ObjectId,
    friendId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession,
  ): Promise<void> {
    await Friend.updateOne(
      {
        userId,
        friendId,
      },
      {
        $set: {
          status: "active",
          deletedAt: null,
        },
        $setOnInsert: {
          userId,
          friendId,
        },
      },
      {
        upsert: true,
        session,
        runValidators: true,
      },
    );
  }
}

export const mongoFriendCommandRepository =
  new MongoFriendCommandRepository();