import mongoose from "mongoose";

import { Friend } from "../../../../../../infrastructure/database/models/friend.model";
import { FriendRequest } from "../../../../../../infrastructure/database/models/friend-request.model";
import { User } from "../../../../../../infrastructure/database/models/user.model";
import type { IFriendRequestRepository } from "../../../domain/repositories/friend-request.repository.interface";
import type {
  FriendRequestsPage,
  ListFriendRequestsInput,
} from "../../../domain/friends.types";
import { MongoFriendsBaseRepository } from "../shared/mongo-friends-base.repository";
import { MongoFriendsMapper } from "../shared/mongo-friends.mapper";
import { MongoFriendsNormalizer } from "../shared/mongo-friends-normalizer";
import type {
  MongoRelationshipRecord,
  MongoRequestFacetRecord,
} from "../shared/mongo-friends.types";

export class MongoFriendRequestRepository
  extends MongoFriendsBaseRepository
  implements IFriendRequestRepository
{
  constructor(private readonly _mapper = new MongoFriendsMapper()) {
    super();
  }

  listReceivedRequests(
    input: ListFriendRequestsInput,
  ): Promise<FriendRequestsPage> {
    return this.listRequests(input, "received");
  }

  listSentRequests(
    input: ListFriendRequestsInput,
  ): Promise<FriendRequestsPage> {
    return this.listRequests(input, "sent");
  }

  private async listRequests(
    input: ListFriendRequestsInput,
    direction: "received" | "sent",
  ): Promise<FriendRequestsPage> {
    return this.execute(
      "FRIEND_REQUEST_LIST_READ_FAILED",
      "Failed to read friend requests",
      async () => {
        const viewerUserId = MongoFriendsNormalizer.toObjectId(
          input.viewerUserId,
          "INVALID_VIEWER_USER_ID",
        );
        const skip = (input.page - 1) * input.limit;
        const counterpartField =
          direction === "received" ? "$senderId" : "$receiverId";
        const ownershipMatch =
          direction === "received"
            ? { receiverId: viewerUserId }
            : { senderId: viewerUserId };

        const [facet] = await FriendRequest.aggregate<MongoRequestFacetRecord>([
          {
            $match: {
              ...ownershipMatch,
              status: "pending",
              deletedAt: null,
            },
          },
          {
            $lookup: {
              from: User.collection.name,
              localField: direction === "received" ? "senderId" : "receiverId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $match: {
              "user.status": "active",
              "user.deletedAt": null,
            },
          },
          {
            $sort: {
              createdAt: -1,
              _id: -1,
            },
          },
          {
            $project: {
              request: {
                _id: "$_id",
                senderId: "$senderId",
                receiverId: "$receiverId",
                pairKey: "$pairKey",
                status: "$status",
                message: "$message",
                deletedAt: "$deletedAt",
                createdAt: "$createdAt",
                updatedAt: "$updatedAt",
              },
              user: {
                _id: counterpartField,
                fullName: "$user.fullName",
                username: "$user.username",
                avatarUrl: "$user.avatarUrl",
                level: "$user.level",
              },
            },
          },
          {
            $facet: {
              items: [{ $skip: skip }, { $limit: input.limit }],
              metadata: [{ $count: "count" }],
            },
          },
        ] as mongoose.PipelineStage[]);

        const records = facet?.items ?? [];
        const candidateIds = records.map((record) =>
          MongoFriendsNormalizer.toObjectId(this._mapper.toId(record.user._id)),
        );
        const mutualCounts = await this.findMutualCounts(
          viewerUserId,
          candidateIds,
        );
        const items = records.map((record) =>
          this._mapper.toFriendRequestSummaryEntity(
            record.request,
            record.user,
            mutualCounts.get(this._mapper.toId(record.user._id)) ?? 0,
            direction,
          ),
        );
        const total = facet?.metadata?.[0]?.count ?? 0;

        return {
          items,
          page: input.page,
          limit: input.limit,
          total,
          hasMore: skip + items.length < total,
        };
      },
    );
  }

  private async findMutualCounts(
    viewerUserId: mongoose.Types.ObjectId,
    candidateIds: mongoose.Types.ObjectId[],
  ): Promise<Map<string, number>> {
    const counts = new Map<string, number>();

    for (const candidateId of candidateIds) {
      counts.set(candidateId.toString(), 0);
    }

    if (candidateIds.length === 0) {
      return counts;
    }

    const viewerFriends = await Friend.find({
      userId: viewerUserId,
      status: "active",
      deletedAt: null,
    })
      .select({ friendId: 1 })
      .lean<Array<{ friendId: mongoose.Types.ObjectId }>>();

    const viewerFriendIds = viewerFriends.map((record) => record.friendId);

    if (viewerFriendIds.length === 0) {
      return counts;
    }

    const mutualRecords = await Friend.find({
      userId: { $in: candidateIds },
      friendId: { $in: viewerFriendIds },
      status: "active",
      deletedAt: null,
    })
      .select({ userId: 1, friendId: 1 })
      .lean<MongoRelationshipRecord[]>();

    for (const record of mutualRecords) {
      const candidateId = record.userId.toString();
      counts.set(candidateId, (counts.get(candidateId) ?? 0) + 1);
    }

    return counts;
  }
}

export const mongoFriendRequestRepository = new MongoFriendRequestRepository();
