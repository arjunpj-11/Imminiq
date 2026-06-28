import { Upload } from '../../../../infrastructure/database/models/upload.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import {
  UPLOAD_MODULE,
  UPLOAD_REFERENCE_TYPE,
} from '../../domain/constants/uploads.constants'
import type {
  SaveUploadRecordInput,
  SetProfileAvatarUrlInput,
  SetProfileBannerUrlInput,
  SoftDeleteLatestProfileUploadInput,
  UploadsRepositoryContract,
} from '../../domain/repositories/uploads.repository.interface'
import { MongoUploadsBaseRepository } from './mongo-uploads-base.repository'
import { MongoUploadsErrorMapper } from './mongo-uploads-error.mapper'
import { MongoUploadsMapper } from './mongo-uploads.mapper'
import type {
  MongoIdLike,
  MongoUploadRecord,
  MongooseObjectLike,
} from './mongo-uploads.types'

export class MongoUploadsRepository
  extends MongoUploadsBaseRepository
  implements UploadsRepositoryContract
{
  constructor(private readonly _mapper = new MongoUploadsMapper()) {
    super()
  }

  async saveUploadRecord(
    input: SaveUploadRecordInput,
  ) {
    return this.execute(
      'UPLOAD_RECORD_CREATE_FAILED',
      'Failed to save upload record',
      async () => {
        const upload = await Upload.create({
          userId: this.toObjectId(input.userId),
          fileName: input.file.fileName,
          fileType: input.kind,
          fileUrl: input.file.fileUrl,
          mimeType: input.file.mimeType,
          sizeBytes: input.file.sizeBytes,
          module: UPLOAD_MODULE,
          referenceType: UPLOAD_REFERENCE_TYPE,
          referenceId: this.toObjectId(input.referenceId),
          ...(input.file.storagePublicId
            ? { storagePublicId: input.file.storagePublicId }
            : {}),
        })

        return this._mapper.toUploadEntityOrThrow(
          this._mapper.toPlainRecord<MongoUploadRecord>(
            upload as MongooseObjectLike<MongoUploadRecord>,
          ),
        )
      },
      MongoUploadsErrorMapper.mapDuplicateUploadRecordError,
    )
  }

  async setAvatarUrl(input: SetProfileAvatarUrlInput) {
    return this.execute(
      'UPLOAD_AVATAR_UPDATE_FAILED',
      'Failed to update avatar url',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: this.toObjectId(input.userId),
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
          },
        ).lean<{ _id: MongoIdLike }>()

        return Boolean(user)
      },
    )
  }

  async clearAvatarUrl(userId: string) {
    return this.execute(
      'UPLOAD_AVATAR_CLEAR_FAILED',
      'Failed to clear avatar url',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: this.toObjectId(userId),
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
          },
        ).lean<{ _id: MongoIdLike }>()

        return Boolean(user)
      },
    )
  }

  async setBannerUrl(input: SetProfileBannerUrlInput) {
    return this.execute(
      'UPLOAD_BANNER_UPDATE_FAILED',
      'Failed to update banner url',
      async () => {
        const userObjectId = this.toObjectId(input.userId)

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
          },
        ).lean<{ _id: MongoIdLike }>()

        return Boolean(profile)
      },
    )
  }

  async clearBannerUrl(userId: string) {
    return this.execute(
      'UPLOAD_BANNER_CLEAR_FAILED',
      'Failed to clear banner url',
      async () => {
        const profile = await UserProfile.findOneAndUpdate(
          {
            userId: this.toObjectId(userId),
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
          },
        ).lean<{ _id: MongoIdLike }>()

        return Boolean(profile)
      },
    )
  }

  async softDeleteLatestProfileUpload(
    input: SoftDeleteLatestProfileUploadInput,
  ) {
    return this.execute(
      'UPLOAD_DELETE_FAILED',
      'Failed to delete latest profile upload',
      async () => {
        const upload = await Upload.findOneAndUpdate(
          {
            userId: this.toObjectId(input.userId),
            fileType: input.kind,
            module: UPLOAD_MODULE,
            deletedAt: null,
          },
          {
            $set: {
              deletedAt: new Date(),
            },
          },
          {
            sort: {
              createdAt: -1,
            },
            returnDocument: 'after',
          },
        ).lean<MongoUploadRecord>()

        return Boolean(upload)
      },
    )
  }
}

export const mongoUploadsRepository = new MongoUploadsRepository()