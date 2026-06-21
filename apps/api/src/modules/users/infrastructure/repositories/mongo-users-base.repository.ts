import { Types } from 'mongoose'

import { UsersDomainError } from '../../domain/errors/users-domain.error'
import type { UserIdInput } from '../../domain/value-objects/user-id.vo'
import type { ErrorMapper } from './mongo-users-error.mapper'

export abstract class MongoUsersBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof UsersDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new UsersDomainError(code, message)
    }
  }

  protected toObjectId(id: UserIdInput | string): Types.ObjectId {
    const value = id.toString()

    if (!Types.ObjectId.isValid(value)) {
      throw new UsersDomainError('INVALID_USER_ID', 'Invalid user id')
    }

    return new Types.ObjectId(value)
  }
}