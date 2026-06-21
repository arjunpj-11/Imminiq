import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { MongoDuplicateKeyError } from './mongo-uploads.types'

export type ErrorMapper = (error: unknown) => UploadsDomainError | null

export class MongoUploadsErrorMapper {
  static mapDuplicateUploadRecordError(
    error: unknown
  ): UploadsDomainError | null {
    if (!MongoUploadsErrorMapper.isDuplicateKeyError(error)) {
      return null
    }

    return new UploadsDomainError(
      'DUPLICATE_UPLOAD_RECORD',
      'Duplicate upload record'
    )
  }

  private static isDuplicateKeyError(
    error: unknown
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as MongoDuplicateKeyError).code === 11000
    )
  }
}