import { UsersDomainError } from '../../../domain/errors/users-domain.error'
import type { MongoDuplicateKeyError } from './mongo-users.types'

export type ErrorMapper = (error: unknown) => UsersDomainError | null

export class MongoUsersErrorMapper {
  static mapDuplicateUserRecordError(error: unknown): UsersDomainError | null {
    if (!MongoUsersErrorMapper.isDuplicateKeyError(error)) {
      return null
    }

    return new UsersDomainError(
      'DUPLICATE_USER_RECORD',
      'User record already exists'
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