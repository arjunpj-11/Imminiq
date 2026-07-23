import { Friend } from '../../../../../../infrastructure/database/models/friend.model';
import { UserBlock } from '../../../../../../infrastructure/database/models/user-block.model';
import type { IChatRelationshipRepository } from '../../../domain/repositories/chat-relationship.repository.interface';
import { MongoChatBaseRepository } from '../shared/mongo-chat-base.repository';
import { MongoChatNormalizer } from '../shared/mongo-chat-normalizer';

export class MongoChatRelationshipRepository
  extends MongoChatBaseRepository
  implements IChatRelationshipRepository
{
  async areActiveFriends(firstUserId: string, secondUserId: string) {
    return this.execute('CHAT_RELATIONSHIP_READ_FAILED', 'Failed to verify friendship', async () => {
      const first = MongoChatNormalizer.toObjectId(firstUserId, 'INVALID_CHAT_VIEWER_ID');
      const second = MongoChatNormalizer.toObjectId(
        secondUserId,
        'INVALID_CHAT_PARTICIPANT_ID'
      );
      const [relationship, block] = await Promise.all([
        Friend.exists({
          userId: first,
          friendId: second,
          status: 'active',
          deletedAt: null,
        }),
        UserBlock.exists({
          $or: [
            { blockerUserId: first, blockedUserId: second },
            { blockerUserId: second, blockedUserId: first },
          ],
          deletedAt: null,
        }),
      ]);
      return Boolean(relationship) && !block;
    });
  }
}

export const mongoChatRelationshipRepository = new MongoChatRelationshipRepository();
