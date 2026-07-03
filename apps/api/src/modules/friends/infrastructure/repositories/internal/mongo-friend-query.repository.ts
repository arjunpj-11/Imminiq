import mongoose from "mongoose";

import { Friend } from "../../../../../infrastructure/database/models/friend.model";
import { FriendRequest } from "../../../../../infrastructure/database/models/friend-request.model";
import { User } from "../../../../../infrastructure/database/models/user.model";
import { UserProfile } from "../../../../../infrastructure/database/models/user-profile.model";
import type { FriendQueryRepositoryContract } from "../../../domain/repositories/friend-query.repository.interface";
import type {
  FriendUsersPage,
  ListFriendsInput,
  SearchFriendUsersInput,
} from "../../../domain/types/friends.types";
import type { FriendRelationshipStatus } from "../../../domain/value-objects/friend-relationship-status.vo";
import { MongoFriendsBaseRepository } from "../shared/mongo-friends-base.repository";
import { MongoFriendsMapper } from "../shared/mongo-friends.mapper";
import { MongoFriendsNormalizer } from "../shared/mongo-friends-normalizer";
import type {
  MongoFriendListFacetRecord,
  MongoFriendUserRecord,
  MongoPendingRequestRelationshipRecord,
  MongoRelationshipRecord,
  MongoSearchFacetRecord,
} from "../shared/mongo-friends.types";

export class MongoFriendQueryRepository
  extends MongoFriendsBaseRepository
  implements FriendQueryRepositoryContract
{
  constructor(private readonly _mapper = new MongoFriendsMapper()) {
    super();
  }

  async searchUsers(input: SearchFriendUsersInput): Promise<FriendUsersPage> {
    return this.execute(
      "FRIEND_USER_SEARCH_FAILED",
      "Failed to search users",
      async () => {
        const viewerUserId = MongoFriendsNormalizer.toObjectId(
          input.viewerUserId,
          "INVALID_VIEWER_USER_ID",
        );
        const normalizedQuery = MongoFriendsNormalizer.search(input.query);
        const searchPattern = new RegExp(
          MongoFriendsNormalizer.escapeRegex(normalizedQuery),
          "i",
        );
        const skip = (input.page - 1) * input.limit;

        const [facet] = await User.aggregate<MongoSearchFacetRecord>([
          {
            $match: {
              _id: { $ne: viewerUserId },
              status: "active",
              deletedAt: null,
              role: {
                $nin: ["admin", "superadmin"],
              },
              $or: [{ fullName: searchPattern }, { username: searchPattern }],
            },
          },
          {
            $lookup: {
              from: UserProfile.collection.name,
              let: { candidateUserId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$userId", "$$candidateUserId"],
                    },
                    deletedAt: null,
                  },
                },
                {
                  $project: {
                    _id: 0,
                    publicProfileEnabled: 1,
                  },
                },
                { $limit: 1 },
              ],
              as: "profile",
            },
          },
          {
            $match: {
              $or: [
                {
                  "profile.0": {
                    $exists: false,
                  },
                },
                {
                  "profile.0.publicProfileEnabled": true,
                },
              ],
            },
          },
          {
            $addFields: {
              searchPriority: {
                $cond: [
                  {
                    $eq: ["$username", normalizedQuery],
                  },
                  0,
                  1,
                ],
              },
            },
          },
          {
            $sort: {
              searchPriority: 1,
              username: 1,
              _id: 1,
            },
          },
          {
            $project: {
              _id: 1,
              fullName: 1,
              username: 1,
              avatarUrl: 1,
              level: 1,
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
        const enriched = await this.enrichUsers(viewerUserId, records);
        const total = facet?.metadata?.[0]?.count ?? 0;

        return {
          items: enriched,
          page: input.page,
          limit: input.limit,
          total,
          hasMore: skip + enriched.length < total,
        };
      },
    );
  }

  async listFriends(input: ListFriendsInput): Promise<FriendUsersPage> {
    return this.execute(
      "FRIEND_LIST_READ_FAILED",
      "Failed to read friends",
      async () => {
        const viewerUserId = MongoFriendsNormalizer.toObjectId(
          input.viewerUserId,
          "INVALID_VIEWER_USER_ID",
        );
        const skip = (input.page - 1) * input.limit;
        const normalizedSearch = input.search
          ? MongoFriendsNormalizer.search(input.search)
          : "";
        const searchPattern = normalizedSearch
          ? new RegExp(
              MongoFriendsNormalizer.escapeRegex(normalizedSearch),
              "i",
            )
          : null;

        const pipeline: mongoose.PipelineStage[] = [
          {
            $match: {
              userId: viewerUserId,
              status: "active",
              deletedAt: null,
            },
          },
          {
            $lookup: {
              from: User.collection.name,
              localField: "friendId",
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
        ];

        if (searchPattern) {
          pipeline.push({
            $match: {
              $or: [
                { "user.fullName": searchPattern },
                { "user.username": searchPattern },
              ],
            },
          });
        }

        pipeline.push(
          {
            $sort: {
              "user.fullName": 1,
              "user.username": 1,
              _id: 1,
            },
          },
          {
            $project: {
              friendCreatedAt: "$createdAt",
              user: {
                _id: "$user._id",
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
        );

        const [facet] =
          await Friend.aggregate<MongoFriendListFacetRecord>(pipeline);

        const records = (facet?.items ?? []).map((item) => item.user);
        const mutualCounts = await this.findMutualCounts(
          viewerUserId,
          records.map((record) =>
            MongoFriendsNormalizer.toObjectId(this._mapper.toId(record._id)),
          ),
        );
        const items = records.map((record) =>
          this._mapper.toFriendUserEntity(
            record,
            mutualCounts.get(this._mapper.toId(record._id)) ?? 0,
            "friends",
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

  async findFriendUser(viewerUserIdValue: string, friendUserIdValue: string) {
    return this.execute(
      "FRIEND_USER_READ_FAILED",
      "Failed to read friend user",
      async () => {
        const viewerUserId = MongoFriendsNormalizer.toObjectId(
          viewerUserIdValue,
          "INVALID_VIEWER_USER_ID",
        );
        const friendUserId = MongoFriendsNormalizer.toObjectId(
          friendUserIdValue,
          "INVALID_FRIEND_USER_ID",
        );

        const friendshipExists = await Friend.exists({
          userId: viewerUserId,
          friendId: friendUserId,
          status: "active",
          deletedAt: null,
        });

        if (!friendshipExists) {
          return null;
        }

        const user = await User.findOne({
          _id: friendUserId,
          status: "active",
          deletedAt: null,
        })
          .select({
            _id: 1,
            fullName: 1,
            username: 1,
            avatarUrl: 1,
            level: 1,
          })
          .lean<MongoFriendUserRecord>();

        if (!user) {
          return null;
        }

        const mutualCounts = await this.findMutualCounts(viewerUserId, [
          friendUserId,
        ]);

        return this._mapper.toFriendUserEntity(
          user,
          mutualCounts.get(friendUserId.toString()) ?? 0,
          "friends",
        );
      },
    );
  }

  private async enrichUsers(
    viewerUserId: mongoose.Types.ObjectId,
    records: MongoFriendUserRecord[],
  ) {
    if (records.length === 0) {
      return [];
    }

    const candidateIds = records.map((record) =>
      MongoFriendsNormalizer.toObjectId(this._mapper.toId(record._id)),
    );

    const [relationshipStates, mutualCounts] = await Promise.all([
      this.findRelationshipStates(viewerUserId, candidateIds),
      this.findMutualCounts(viewerUserId, candidateIds),
    ]);

    return records.map((record) => {
      const userId = this._mapper.toId(record._id);

      return this._mapper.toFriendUserEntity(
        record,
        mutualCounts.get(userId) ?? 0,
        relationshipStates.get(userId) ?? "none",
      );
    });
  }

  private async findRelationshipStates(
    viewerUserId: mongoose.Types.ObjectId,
    candidateIds: mongoose.Types.ObjectId[],
  ): Promise<Map<string, FriendRelationshipStatus>> {
    const states = new Map<string, FriendRelationshipStatus>();

    for (const candidateId of candidateIds) {
      states.set(candidateId.toString(), "none");
    }

    const friendships = await Friend.find({
      userId: viewerUserId,
      friendId: { $in: candidateIds },
      status: "active",
      deletedAt: null,
    })
      .select({ userId: 1, friendId: 1 })
      .lean<MongoRelationshipRecord[]>();

    for (const friendship of friendships) {
      states.set(friendship.friendId.toString(), "friends");
    }

    const pairKeys = candidateIds.map((candidateId) =>
      MongoFriendsNormalizer.pairKey(viewerUserId, candidateId),
    );

    const pendingRequests = await FriendRequest.find({
      pairKey: { $in: pairKeys },
      status: "pending",
      deletedAt: null,
    })
      .select({
        senderId: 1,
        receiverId: 1,
        pairKey: 1,
      })
      .lean<MongoPendingRequestRelationshipRecord[]>();

    for (const request of pendingRequests) {
      const senderId = request.senderId.toString();
      const receiverId = request.receiverId.toString();
      const counterpartId =
        senderId === viewerUserId.toString() ? receiverId : senderId;

      if (states.get(counterpartId) === "friends") {
        continue;
      }

      states.set(
        counterpartId,
        senderId === viewerUserId.toString()
          ? "pending_sent"
          : "pending_received",
      );
    }

    return states;
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

    const viewerFriendRecords = await Friend.find({
      userId: viewerUserId,
      status: "active",
      deletedAt: null,
    })
      .select({ friendId: 1 })
      .lean<Array<{ friendId: mongoose.Types.ObjectId }>>();

    const viewerFriendIds = viewerFriendRecords.map(
      (record) => record.friendId,
    );

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

export const mongoFriendQueryRepository = new MongoFriendQueryRepository();
