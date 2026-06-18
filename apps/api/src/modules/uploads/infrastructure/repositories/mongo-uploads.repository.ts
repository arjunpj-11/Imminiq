import { Types } from 'mongoose'

import { Upload } from '../../../../infrastructure/database/models/upload.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import {
  UPLOAD_MODULE,
  UPLOAD_REFERENCE_TYPE,
} from '../../domain/constants/uploads.constants'
import type { StoredProfileImageEntity } from '../../domain/entities/stored-profile-image.entity'
import { UploadedProfileImageEntity } from '../../domain/entities/uploaded-profile-image.entity'
import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { UploadsRepositoryContract } from '../../domain/repositories/uploads.repository.interface'
import type { ProfileUploadKind } from '../../domain/value-objects/profile-upload-kind.vo'

type MongoIdLike = {
  toString(): string
}

type MongoUploadRecord = {
  _id: MongoIdLike
  userId: MongoIdLike | string
  fileName: string
  fileType: string
  fileUrl: string
  mimeType: string
  sizeBytes: number
  storagePublicId?: string
  referenceId: MongoIdLike | string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

type MongooseObjectLike<T> = {
  toObject(): T
}

export class MongoUploadsRepository implements UploadsRepositoryContract {
  async saveUploadRecord(
    userId: string,
    kind: ProfileUploadKind,
    file: StoredProfileImageEntity,
    referenceId: string,
  ): Promise<UploadedProfileImageEntity> {
    try {
      const upload = await Upload.create({
        userId: this.toObjectId(userId),
        fileName: file.fileName,
        fileType: kind,
        fileUrl: file.fileUrl,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        module: UPLOAD_MODULE,
        referenceType: UPLOAD_REFERENCE_TYPE,
        referenceId: this.toObjectId(referenceId),
        ...(file.storagePublicId
          ? { storagePublicId: file.storagePublicId }
          : {}),
      })

      return this.toUploadEntityOrThrow(
        this.toPlainRecord(upload as MongooseObjectLike<MongoUploadRecord>),
      )
    } catch (error) {
      this.throwMappedPersistenceError(error)
    }
  }

  async setAvatarUrl(userId: string, avatarUrl: string): Promise<boolean> {
    try {
      const user = await User.findOneAndUpdate(
        { _id: this.toObjectId(userId), deletedAt: null },
        { $set: { avatarUrl } },
        { returnDocument: 'after', runValidators: true },
      ).lean<{ _id: MongoIdLike }>()

      return Boolean(user)
    } catch (error) {
      this.throwMappedPersistenceError(error)
    }
  }

  async clearAvatarUrl(userId: string): Promise<boolean> {
    try {
      const user = await User.findOneAndUpdate(
        { _id: this.toObjectId(userId), deletedAt: null },
        { $set: { avatarUrl: '' } },
        { returnDocument: 'after', runValidators: true },
      ).lean<{ _id: MongoIdLike }>()

      return Boolean(user)
    } catch (error) {
      this.throwMappedPersistenceError(error)
    }
  }

  async setBannerUrl(userId: string, bannerUrl: string): Promise<boolean> {
    try {
      const profile = await UserProfile.findOneAndUpdate(
        { userId: this.toObjectId(userId), deletedAt: null },
        { $set: { profileBannerUrl: bannerUrl } },
        {
          returnDocument: 'after',
          runValidators: true,
          upsert: true,
        },
      ).lean<{ _id: MongoIdLike }>()

      return Boolean(profile)
    } catch (error) {
      this.throwMappedPersistenceError(error)
    }
  }

  async clearBannerUrl(userId: string): Promise<boolean> {
    try {
      const profile = await UserProfile.findOneAndUpdate(
        { userId: this.toObjectId(userId), deletedAt: null },
        { $set: { profileBannerUrl: '' } },
        { returnDocument: 'after', runValidators: true },
      ).lean<{ _id: MongoIdLike }>()

      return Boolean(profile)
    } catch (error) {
      this.throwMappedPersistenceError(error)
    }
  }

  async softDeleteLatestProfileUpload(
    userId: string,
    kind: ProfileUploadKind,
  ): Promise<boolean> {
    try {
      const upload = await Upload.findOneAndUpdate(
        {
          userId: this.toObjectId(userId),
          fileType: kind,
          module: UPLOAD_MODULE,
          deletedAt: null,
        },
        { $set: { deletedAt: new Date() } },
        { sort: { createdAt: -1 }, returnDocument: 'after' },
      ).lean<MongoUploadRecord>()

      return Boolean(upload)
    } catch (error) {
      this.throwMappedPersistenceError(error)
    }
  }

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new UploadsDomainError(
        'INVALID_IDENTIFIER',
        'Invalid uploads identifier',
      )
    }

    return new Types.ObjectId(id)
  }

  private toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  private toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject()
  }

  private toUploadEntity(
    upload: MongoUploadRecord | null,
  ): UploadedProfileImageEntity | null {
    if (!upload) {
      return null
    }

    return new UploadedProfileImageEntity({
      id: this.toId(upload._id),
      userId: this.toId(upload.userId),
      kind: upload.fileType as ProfileUploadKind,
      fileUrl: upload.fileUrl,
      fileName: upload.fileName,
      fileType: upload.fileType,
      mimeType: upload.mimeType,
      sizeBytes: upload.sizeBytes,
      referenceId: this.toId(upload.referenceId),
      ...(upload.storagePublicId !== undefined
        ? { storagePublicId: upload.storagePublicId }
        : {}),
      ...(upload.createdAt !== undefined
        ? { createdAt: upload.createdAt }
        : {}),
      ...(upload.updatedAt !== undefined
        ? { updatedAt: upload.updatedAt }
        : {}),
      ...(upload.deletedAt !== undefined
        ? { deletedAt: upload.deletedAt }
        : {}),
    })
  }

  private toUploadEntityOrThrow(
    upload: MongoUploadRecord | null,
  ): UploadedProfileImageEntity {
    const entity = this.toUploadEntity(upload)

    if (!entity) {
      throw new UploadsDomainError(
        'UPLOAD_MAPPING_FAILED',
        'Failed to map upload entity',
      )
    }

    return entity
  }

  private throwMappedPersistenceError(error: unknown): never {
    if (error instanceof UploadsDomainError) {
      throw error
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      throw new UploadsDomainError(
        'DUPLICATE_UPLOAD_RECORD',
        'Duplicate upload record',
      )
    }

    throw new UploadsDomainError(
      'UPLOADS_PERSISTENCE_ERROR',
      'Uploads persistence failed',
    )
  }
}

export const mongoUploadsRepository = new MongoUploadsRepository()
