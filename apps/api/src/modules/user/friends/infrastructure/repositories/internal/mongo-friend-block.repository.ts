import { UserBlock } from '../../../../../../infrastructure/database/models/user-block.model';
import type { IFriendBlockRepository } from '../../../domain/repositories/friend-block.repository.interface';
import { MongoFriendsBaseRepository } from '../shared/mongo-friends-base.repository';
import { MongoFriendsNormalizer } from '../shared/mongo-friends-normalizer';

export class MongoFriendBlockRepository
  extends MongoFriendsBaseRepository
  implements IFriendBlockRepository
{
  async listBlockedByUserIds(viewerUserId: string) {
    return this.execute(
      'FRIEND_BLOCK_READ_FAILED',
      'Failed to load friend privacy state',
      async () => {
        const records = await UserBlock.find({
          blockedUserId: MongoFriendsNormalizer.toObjectId(viewerUserId),
          deletedAt: null,
        })
          .select('blockerUserId')
          .lean<Array<{ blockerUserId: { toString(): string } }>>();
        return records.map((record) => record.blockerUserId.toString());
      }
    );
  }
}

export const mongoFriendBlockRepository = new MongoFriendBlockRepository();
