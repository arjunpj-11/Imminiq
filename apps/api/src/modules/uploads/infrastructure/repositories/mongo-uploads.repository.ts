import { Types } from 'mongoose'

import { Upload } from '../../../../infrastructure/database/models/upload.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import type {
  ProfileUploadKind,
  StoredProfileImage,
} from '../../domain/types/uploads.types'
import type {
  UploadRecordLike,
  UploadsRepository,
} from '../../domain/repositories/uploads.repository.interface'

const toObjectId = (id: string) => new Types.ObjectId(id)

export const mongoUploadsRepository: UploadsRepository = {
  async saveUploadRecord(
    userId: string,
    kind: ProfileUploadKind,
    file: StoredProfileImage,
    referenceId: string
  ): Promise<UploadRecordLike> {
    const upload = await Upload.create({
      userId: toObjectId(userId),
      fileName: file.fileName,
      fileType: kind,
      fileUrl: file.fileUrl,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      module: 'profile',
      referenceType: 'user_profile',
      referenceId: toObjectId(referenceId),
    })

    return upload.toObject() as UploadRecordLike
  },

  async setAvatarUrl(userId: string, avatarUrl: string) {
    return User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { $set: { avatarUrl } },
      { returnDocument: 'after', runValidators: true }
    ).lean()
  },

  async clearAvatarUrl(userId: string) {
    return User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { $set: { avatarUrl: '' } },
      { returnDocument: 'after', runValidators: true }
    ).lean()
  },

  async setBannerUrl(userId: string, bannerUrl: string) {
    return UserProfile.findOneAndUpdate(
      { userId: toObjectId(userId), deletedAt: null },
      { $set: { profileBannerUrl: bannerUrl } },
      { returnDocument: 'after', runValidators: true, upsert: true }
    ).lean()
  },

  async clearBannerUrl(userId: string) {
    return UserProfile.findOneAndUpdate(
      { userId: toObjectId(userId), deletedAt: null },
      { $set: { profileBannerUrl: '' } },
      { returnDocument: 'after', runValidators: true }
    ).lean()
  },

  findProfileByUserId(userId: string) {
    return UserProfile.findOne({
      userId: toObjectId(userId),
      deletedAt: null,
    }).lean()
  },

  async softDeleteLatestProfileUpload(
    userId: string,
    kind: ProfileUploadKind
  ) {
    return Upload.findOneAndUpdate(
      {
        userId: toObjectId(userId),
        fileType: kind,
        module: 'profile',
        deletedAt: null,
      },
      { $set: { deletedAt: new Date() } },
      { sort: { createdAt: -1 }, returnDocument: 'after' }
    ).lean()
  },
}
