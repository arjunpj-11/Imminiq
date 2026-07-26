import { Friend } from '../../../../../../infrastructure/database/models/friend.model';
import { UserBlock } from '../../../../../../infrastructure/database/models/user-block.model';
import type { ICallRelationshipRepository } from '../../../domain/repositories/call-relationship.repository.interface';
import { MongoCallBaseRepository } from '../shared/mongo-call-base.repository';
import { MongoCallNormalizer } from '../shared/mongo-call-normalizer';

export class MongoCallRelationshipRepository
  extends MongoCallBaseRepository
  implements ICallRelationshipRepository
{
  async hasBlockBetween(firstUserId: string, secondUserId: string) {
    return this.execute(
      'CALL_RELATIONSHIP_READ_FAILED',
      'Failed to verify call block state',
      async () => {
        const first = MongoCallNormalizer.toObjectId(firstUserId, 'INVALID_CALL_CALLER_ID');
        const second = MongoCallNormalizer.toObjectId(secondUserId, 'INVALID_CALL_CALLEE_ID');
        return Boolean(
          await UserBlock.exists({
            $or: [
              { blockerUserId: first, blockedUserId: second },
              { blockerUserId: second, blockedUserId: first },
            ],
            deletedAt: null,
          })
        );
      }
    );
  }

  async areActiveFriends(firstUserId: string, secondUserId: string) {
    return this.execute(
      'CALL_RELATIONSHIP_READ_FAILED',
      'Failed to verify friendship',
      async () => {
        const first = MongoCallNormalizer.toObjectId(firstUserId, 'INVALID_CALL_CALLER_ID');
        const second = MongoCallNormalizer.toObjectId(secondUserId, 'INVALID_CALL_CALLEE_ID');
        const relationship = await Friend.exists({
          userId: first,
          friendId: second,
          status: 'active',
          deletedAt: null,
        });
        if (!relationship) return false;
        return !(await this.hasBlockBetween(firstUserId, secondUserId));
      }
    );
  }
}

export const mongoCallRelationshipRepository = new MongoCallRelationshipRepository();
