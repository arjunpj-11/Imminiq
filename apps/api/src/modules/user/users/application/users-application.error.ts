import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { UsersDomainError } from '../domain/users-domain.error';

export type UsersApplicationErrorCode =
  | 'USER_NOT_FOUND'
  | 'PUBLIC_PROFILE_NOT_AVAILABLE'
  | 'PROFILE_UPDATE_FAILED'
  | 'USER_NAME_UPDATE_FAILED'
  | 'UNAUTHORIZED';

export class UsersApplicationError extends UsersDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: UsersApplicationErrorCode, message: string) {
    super(code, message);
    this.kind = kind;
    this.name = 'UsersApplicationError';
  }

  static userNotFound(): UsersApplicationError {
    return new UsersApplicationError('missing-resource', 'USER_NOT_FOUND', 'User not found');
  }

  static publicProfileNotAvailable(): UsersApplicationError {
    return new UsersApplicationError(
      'missing-resource',
      'PUBLIC_PROFILE_NOT_AVAILABLE',
      'Public profile not available'
    );
  }

  static profileUpdateFailed(): UsersApplicationError {
    return new UsersApplicationError('internal', 'PROFILE_UPDATE_FAILED', 'Profile update failed');
  }

  static userNameUpdateFailed(): UsersApplicationError {
    return new UsersApplicationError(
      'internal',
      'USER_NAME_UPDATE_FAILED',
      'User full name update failed'
    );
  }

  static unauthorized(): UsersApplicationError {
    return new UsersApplicationError('unauthenticated', 'UNAUTHORIZED', 'Unauthorized');
  }
}

export const isUsersApplicationError = (error: unknown): error is UsersApplicationError =>
  error instanceof UsersApplicationError;
