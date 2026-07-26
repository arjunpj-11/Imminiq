import { Friend } from '../../../../../../infrastructure/database/models/friend.model';
import { FriendRequest } from '../../../../../../infrastructure/database/models/friend-request.model';
import { LeaderboardAudience } from '../../../../../../infrastructure/database/models/leaderboard-audience.model';
import { UserBlock } from '../../../../../../infrastructure/database/models/user-block.model';
import type { IChatBlockRepository } from '../../../domain/repositories/chat-block.repository.interface';
import { MongoChatBaseRepository } from '../shared/mongo-chat-base.repository';
import { MongoChatNormalizer } from '../shared/mongo-chat-normalizer';

export class MongoChatBlockRepository
  extends MongoChatBaseRepository
  implements IChatBlockRepository
{
  async hasBlockBetween(firstUserId: string, secondUserId: string) {
    return this.execute('CHAT_BLOCK_READ_FAILED', 'Failed to check user block', async () => {
      const first = MongoChatNormalizer.toObjectId(firstUserId, 'INVALID_CHAT_VIEWER_ID');
      const second = MongoChatNormalizer.toObjectId(secondUserId, 'INVALID_CHAT_PARTICIPANT_ID');
      return Boolean(
        await UserBlock.exists({
          $or: [
            { blockerUserId: first, blockedUserId: second },
            { blockerUserId: second, blockedUserId: first },
          ],
          deletedAt: null,
        })
      );
    });
  }

  async listBlockedUserIds(blockerUserId: string) {
    return this.execute('CHAT_BLOCK_LIST_FAILED', 'Failed to load blocked users', async () => {
      const records = await UserBlock.find({
        blockerUserId: MongoChatNormalizer.toObjectId(blockerUserId, 'INVALID_CHAT_VIEWER_ID'),
        deletedAt: null,
      })
        .select('blockedUserId')
        .lean<Array<{ blockedUserId: { toString(): string } }>>();
      return records.map((record) => record.blockedUserId.toString());
    });
  }

  async listBlockedByUserIds(blockedUserId: string) {
    return this.execute(
      'CHAT_BLOCK_LIST_FAILED',
      'Failed to load users who blocked the viewer',
      async () => {
        const records = await UserBlock.find({
          blockedUserId: MongoChatNormalizer.toObjectId(blockedUserId, 'INVALID_CHAT_VIEWER_ID'),
          deletedAt: null,
        })
          .select('blockerUserId')
          .lean<Array<{ blockerUserId: { toString(): string } }>>();
        return records.map((record) => record.blockerUserId.toString());
      }
    );
  }

  async blockUser(blockerUserId: string, blockedUserId: string) {
    await this.execute('CHAT_BLOCK_WRITE_FAILED', 'Failed to block user', async () => {
      const blocker = MongoChatNormalizer.toObjectId(blockerUserId, 'INVALID_CHAT_VIEWER_ID');
      const blocked = MongoChatNormalizer.toObjectId(blockedUserId, 'INVALID_CHAT_PARTICIPANT_ID');
      await UserBlock.findOneAndUpdate(
        { blockerUserId: blocker, blockedUserId: blocked },
        { $set: { deletedAt: null } },
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
      const now = new Date();
      await Friend.updateMany(
        {
          $or: [
            { userId: blocker, friendId: blocked },
            { userId: blocked, friendId: blocker },
          ],
          status: 'active',
          deletedAt: null,
        },
        { $set: { deletedAt: now } }
      );
      await FriendRequest.updateMany(
        {
          $or: [
            { senderId: blocker, receiverId: blocked },
            { senderId: blocked, receiverId: blocker },
          ],
          status: 'pending',
          deletedAt: null,
        },
        { $set: { status: 'cancelled', deletedAt: now } }
      );
      await LeaderboardAudience.updateOne(
        { userId: blocker },
        { $pull: { friendUserIds: blocked } }
      );
      await LeaderboardAudience.updateOne(
        { userId: blocked },
        { $pull: { friendUserIds: blocker } }
      );
    });
  }

  async unblockUser(blockerUserId: string, blockedUserId: string) {
    return this.execute('CHAT_UNBLOCK_WRITE_FAILED', 'Failed to unblock user', async () => {
      const result = await UserBlock.updateOne(
        {
          blockerUserId: MongoChatNormalizer.toObjectId(blockerUserId, 'INVALID_CHAT_VIEWER_ID'),
          blockedUserId: MongoChatNormalizer.toObjectId(
            blockedUserId,
            'INVALID_CHAT_PARTICIPANT_ID'
          ),
          deletedAt: null,
        },
        { $set: { deletedAt: new Date() } }
      );
      return result.modifiedCount > 0;
    });
  }
}

export const mongoChatBlockRepository = new MongoChatBlockRepository();
