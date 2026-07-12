import { UploadedProfileImageEntity } from '../../../domain/entities/uploaded-profile-image.entity'
import { UploadsDomainError } from '../../../domain/uploads-domain.error'
import type { ProfileUploadKind } from '../../../domain/uploads.types'
import type {
  MongoIdLike,
  MongoUploadRecord,
  MongooseObjectLike,
} from './mongo-uploads.types'

export class MongoUploadsMapper {
  toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject()
  }

  toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  toUploadEntity(
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

  toUploadEntityOrThrow(
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
}
