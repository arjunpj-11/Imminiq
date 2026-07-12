import { Types } from 'mongoose'

import { UploadsDomainError } from '../../../domain/uploads-domain.error'

export class MongoUploadsObjectId {
  private constructor() {}

  static fromString(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new UploadsDomainError(
        'INVALID_IDENTIFIER',
        'Invalid uploads identifier',
      )
    }

    return new Types.ObjectId(id)
  }
}
