import { User } from '../../../../../../infrastructure/database/models/user.model';
import { UserProfile } from '../../../../../../infrastructure/database/models/user-profile.model';
import type { ISharedProfileRepository } from '../../../domain/repositories/shared-profile.repository.interface';
import { MongoChatBaseRepository } from '../shared/mongo-chat-base.repository';

export class MongoSharedProfileRepository
  extends MongoChatBaseRepository
  implements ISharedProfileRepository
{
  async findShareableProfile(username: string, viewerUserId: string) {
    return this.execute('CHAT_PROFILE_READ_FAILED', 'Failed to load shared profile', async () => {
      const user = await User.findOne({
        username: username.trim().toLowerCase(),
        status: 'active',
        deletedAt: null,
      })
        .select('fullName username avatarUrl')
        .lean<{
          _id: { toString(): string };
          fullName: string;
          username: string;
          avatarUrl?: string | null;
        } | null>();

      if (!user) return null;

      const profile = await UserProfile.findOne({
        userId: user._id,
        deletedAt: null,
      })
        .select('headline publicProfileEnabled')
        .lean<{ headline?: string; publicProfileEnabled?: boolean } | null>();

      if (user._id.toString() !== viewerUserId && profile?.publicProfileEnabled === false) {
        return null;
      }

      return {
        userId: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        headline: (profile?.headline ?? '').slice(0, 160),
        avatarUrl: user.avatarUrl ?? null,
      };
    });
  }
}

export const mongoSharedProfileRepository = new MongoSharedProfileRepository();
