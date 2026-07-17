import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { ActivityDomainError } from '../domain/activity-domain.error';

export type ActivityApplicationErrorCode =
  | 'ACTIVITY_USER_NOT_FOUND'
  | 'ACTIVITY_NOT_FOUND'
  | 'ACTIVITY_EVENT_CONFLICT'
  | 'INVALID_ACTIVITY_EVENT'
  | 'INVALID_ACTIVITY_CURSOR'
  | 'INVALID_ACTIVITY_YEAR'
  | 'INVALID_ACTIVITY_UTC_OFFSET';

export class ActivityApplicationError extends ActivityDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: ActivityApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'ActivityApplicationError';
    this.kind = kind;
  }

  static userNotFound(message = 'Activity user not found'): ActivityApplicationError {
    return new ActivityApplicationError('missing-resource', 'ACTIVITY_USER_NOT_FOUND', message);
  }

  static activityNotFound(message = 'Activity not found'): ActivityApplicationError {
    return new ActivityApplicationError('missing-resource', 'ACTIVITY_NOT_FOUND', message);
  }

  static eventConflict(
    message = 'The activity event key is already used by a different event'
  ): ActivityApplicationError {
    return new ActivityApplicationError('conflict', 'ACTIVITY_EVENT_CONFLICT', message);
  }

  static invalidEvent(message: string): ActivityApplicationError {
    return new ActivityApplicationError('invalid-input', 'INVALID_ACTIVITY_EVENT', message);
  }

  static invalidCursor(message = 'Activity cursor is invalid'): ActivityApplicationError {
    return new ActivityApplicationError('invalid-input', 'INVALID_ACTIVITY_CURSOR', message);
  }

  static invalidYear(message = 'Activity year is invalid'): ActivityApplicationError {
    return new ActivityApplicationError('invalid-input', 'INVALID_ACTIVITY_YEAR', message);
  }

  static invalidUtcOffset(message = 'UTC offset is invalid'): ActivityApplicationError {
    return new ActivityApplicationError('invalid-input', 'INVALID_ACTIVITY_UTC_OFFSET', message);
  }
}

export const isActivityApplicationError = (error: unknown): error is ActivityApplicationError =>
  error instanceof ActivityApplicationError;
