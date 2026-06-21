import { Types } from 'mongoose'

import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { ErrorMapper } from './mongo-uploads-error.mapper'

export abstract class MongoUploadsBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof UploadsDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new UploadsDomainError(code, message)
    }
  }

  protected toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new UploadsDomainError(
        'INVALID_IDENTIFIER',
        'Invalid uploads identifier',
      )
    }

    return new Types.ObjectId(id)
  }
}