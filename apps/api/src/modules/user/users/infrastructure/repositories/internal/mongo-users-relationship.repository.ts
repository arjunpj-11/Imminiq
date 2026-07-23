import { Friend } from '../../../../../../infrastructure/database/models/friend.model';
import { FriendRequest } from '../../../../../../infrastructure/database/models/friend-request.model';
import { UserBlock } from '../../../../../../infrastructure/database/models/user-block.model';
import type { GetRelationshipStateInput } from '../../../domain/repositories/users.repository.interface';
import type { RelationshipState } from '../../../domain/value-objects/relationship-state.vo';
import { MongoUsersBaseRepository } from '../shared/mongo-users-base.repository';
import { MongoUsersObjectId } from '../shared/mongo-users-object-id';
import { MONGO_USERS_ACTIVE_FILTER } from '../shared/mongo-users-query.constants';

export class MongoUsersRelationshipRepository extends MongoUsersBaseRepository {
  async hasBlockBetween(firstUserId: string, secondUserId: string) {
    return this.execute(
      'USER_RELATIONSHIP_READ_FAILED',
      'Failed to read user block state',
      async () => {
        const firstId = MongoUsersObjectId.from(firstUserId);
        const secondId = MongoUsersObjectId.from(secondUserId);
        return Boolean(
          await UserBlock.exists({
            $or: [
              { blockerUserId: firstId, blockedUserId: secondId },
              { blockerUserId: secondId, blockedUserId: firstId },
            ],
            deletedAt: null,
          })
        );
      }
    );
  }

  async getRelationshipState(input: GetRelationshipStateInput): Promise<RelationshipState> {
    return this.execute(
      'USER_RELATIONSHIP_READ_FAILED',
      'Failed to read user relationship state',
      async () => {
        if (!input.viewerUserId) {
          return 'not_connected';
        }

        const viewerId = MongoUsersObjectId.from(input.viewerUserId);
        const targetId = MongoUsersObjectId.from(input.targetUserId);

        if (viewerId.equals(targetId)) {
          return 'self';
        }

        const friendship = await Friend.findOne({
          userId: viewerId,
          friendId: targetId,
          status: 'active',
          ...MONGO_USERS_ACTIVE_FILTER,
        }).lean();

        if (friendship) {
          return 'friends';
        }

        const outgoing = await FriendRequest.findOne({
          senderId: viewerId,
          receiverId: targetId,
          status: 'pending',
          ...MONGO_USERS_ACTIVE_FILTER,
        }).lean();

        if (outgoing) {
          return 'request_sent';
        }

        const incoming = await FriendRequest.findOne({
          senderId: targetId,
          receiverId: viewerId,
          status: 'pending',
          ...MONGO_USERS_ACTIVE_FILTER,
        }).lean();

        return incoming ? 'request_received' : 'not_connected';
      }
    );
  }
}

export const mongoUsersRelationshipRepository = new MongoUsersRelationshipRepository();
