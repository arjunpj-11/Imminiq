import { Types } from 'mongoose'

import { CommunityDomainError } from '../../../domain/community-domain.error'
import type { MongoIdLike } from './mongo-community.types'

export class MongoCommunityObjectId {
  private constructor() {}

  static isValid(value: string): boolean {
    return Types.ObjectId.isValid(value)
  }

  static toObjectId(value: string): Types.ObjectId {
    if (!this.isValid(value)) {
      throw new CommunityDomainError('COMMUNITY_INVALID_ID', 'Invalid id')
    }

    return new Types.ObjectId(value)
  }

  static toExistingObjectId(value: MongoIdLike): Types.ObjectId {
    if (value instanceof Types.ObjectId) {
      return value
    }

    return this.toObjectId(String(value))
  }
}
