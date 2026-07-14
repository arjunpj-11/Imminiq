import { User } from '../../../../../infrastructure/database/models/user.model';
import { UserProfile } from '../../../../../infrastructure/database/models/user-profile.model';
import type {
  SetProfileAvatarUrlInput,
  SetProfileBannerUrlInput,
} from '../../../domain/repositories/uploads.repository.interface';
import { MongoUploadsBaseRepository } from '../shared/mongo-uploads-base.repository';
import { MongoUploadsObjectId } from '../shared/mongo-uploads-object-id';
import type { MongoIdLike } from '../shared/mongo-uploads.types';

export class MongoUploadsProfileRepository extends MongoUploadsBaseRepository {
  async setAvatarUrl(input: SetProfileAvatarUrlInput) {
    return this.execute('UPLOAD_AVATAR_UPDATE_FAILED', 'Failed to update avatar url', async () => {
      const user = await User.findOneAndUpdate(
        {
          _id: MongoUploadsObjectId.fromString(input.userId),
          deletedAt: null,
        },
        {
          $set: {
            avatarUrl: input.avatarUrl,
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
        }
      ).lean<{ _id: MongoIdLike }>();

      return Boolean(user);
    });
  }

  async clearAvatarUrl(userId: string) {
    return this.execute('UPLOAD_AVATAR_CLEAR_FAILED', 'Failed to clear avatar url', async () => {
      const user = await User.findOneAndUpdate(
        {
          _id: MongoUploadsObjectId.fromString(userId),
          deletedAt: null,
        },
        {
          $set: {
            avatarUrl: '',
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
        }
      ).lean<{ _id: MongoIdLike }>();

      return Boolean(user);
    });
  }

  async setBannerUrl(input: SetProfileBannerUrlInput) {
    return this.execute('UPLOAD_BANNER_UPDATE_FAILED', 'Failed to update banner url', async () => {
      const userObjectId = MongoUploadsObjectId.fromString(input.userId);

      const profile = await UserProfile.findOneAndUpdate(
        {
          userId: userObjectId,
          deletedAt: null,
        },
        {
          $set: {
            profileBannerUrl: input.bannerUrl,
          },
          $setOnInsert: {
            userId: userObjectId,
            deletedAt: null,
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      ).lean<{ _id: MongoIdLike }>();

      return Boolean(profile);
    });
  }

  async clearBannerUrl(userId: string) {
    return this.execute('UPLOAD_BANNER_CLEAR_FAILED', 'Failed to clear banner url', async () => {
      const profile = await UserProfile.findOneAndUpdate(
        {
          userId: MongoUploadsObjectId.fromString(userId),
          deletedAt: null,
        },
        {
          $set: {
            profileBannerUrl: '',
          },
        },
        {
          returnDocument: 'after',
          runValidators: true,
        }
      ).lean<{ _id: MongoIdLike }>();

      return Boolean(profile);
    });
  }
}

export const mongoUploadsProfileRepository = new MongoUploadsProfileRepository();
