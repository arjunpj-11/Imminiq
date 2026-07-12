import { Types } from 'mongoose'

import { UsersDomainError } from '../../../domain/users-domain.error'
import type { UserIdInput } from '../../../domain/value-objects/user-id.vo'

export class MongoUsersObjectId {
  private constructor() {}

  static from(id: UserIdInput | string): Types.ObjectId {
    const value = id.toString()

    if (!Types.ObjectId.isValid(value)) {
      throw new UsersDomainError('INVALID_USER_ID', 'Invalid user id')
    }

    return new Types.ObjectId(value)
  }
}
