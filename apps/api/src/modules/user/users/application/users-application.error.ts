import { UsersDomainError } from '../domain/users-domain.error'

export type UsersApplicationErrorCode =
  | 'USER_NOT_FOUND'
  | 'PUBLIC_PROFILE_NOT_AVAILABLE'
  | 'PROFILE_UPDATE_FAILED'
  | 'USER_NAME_UPDATE_FAILED'
  | 'UNAUTHORIZED'

export class UsersApplicationError extends UsersDomainError {
  readonly statusCode: number

  private constructor(
    statusCode: number,
    code: UsersApplicationErrorCode,
    message: string,
  ) {
    super(code, message)
    this.statusCode = statusCode
    this.name = 'UsersApplicationError'
  }

  static userNotFound(): UsersApplicationError {
    return new UsersApplicationError(404, 'USER_NOT_FOUND', 'User not found')
  }

  static publicProfileNotAvailable(): UsersApplicationError {
    return new UsersApplicationError(
      404,
      'PUBLIC_PROFILE_NOT_AVAILABLE',
      'Public profile not available',
    )
  }

  static profileUpdateFailed(): UsersApplicationError {
    return new UsersApplicationError(
      500,
      'PROFILE_UPDATE_FAILED',
      'Profile update failed',
    )
  }

  static userNameUpdateFailed(): UsersApplicationError {
    return new UsersApplicationError(
      500,
      'USER_NAME_UPDATE_FAILED',
      'User full name update failed',
    )
  }

  static unauthorized(): UsersApplicationError {
    return new UsersApplicationError(401, 'UNAUTHORIZED', 'Unauthorized')
  }
}

export const isUsersApplicationError = (
  error: unknown,
): error is UsersApplicationError => error instanceof UsersApplicationError
