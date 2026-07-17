import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { LeaderboardDomainError } from '../domain/leaderboard-domain.error';

export type LeaderboardApplicationErrorCode =
  | 'INVALID_LEADERBOARD_LIMIT'
  | 'INVALID_XP_ACTIVITY'
  | 'INVALID_IDEMPOTENCY_KEY'
  | 'LEADERBOARD_USER_NOT_FOUND'
  | 'LEADERBOARD_UNAVAILABLE'
  | 'XP_ACTIVITY_CONFLICT';

export class LeaderboardApplicationError extends LeaderboardDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: LeaderboardApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'LeaderboardApplicationError';
    this.kind = kind;
  }

  static invalidLimit(message = 'Leaderboard limit is invalid'): LeaderboardApplicationError {
    return new LeaderboardApplicationError('invalid-input', 'INVALID_LEADERBOARD_LIMIT', message);
  }

  static invalidXpActivity(message = 'XP activity is invalid'): LeaderboardApplicationError {
    return new LeaderboardApplicationError('invalid-input', 'INVALID_XP_ACTIVITY', message);
  }

  static invalidIdempotencyKey(
    message = 'XP activity idempotency key is invalid'
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError('invalid-input', 'INVALID_IDEMPOTENCY_KEY', message);
  }

  static userNotFound(message = 'Leaderboard user not found'): LeaderboardApplicationError {
    return new LeaderboardApplicationError('missing-resource', 'LEADERBOARD_USER_NOT_FOUND', message);
  }

  static unavailable(
    message = 'Leaderboard is currently unavailable'
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError('dependency-unavailable', 'LEADERBOARD_UNAVAILABLE', message);
  }

  static xpActivityConflict(
    message = 'The idempotency key is already used by a different XP activity'
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError('conflict', 'XP_ACTIVITY_CONFLICT', message);
  }
}

export const isLeaderboardApplicationError = (
  error: unknown
): error is LeaderboardApplicationError => {
  return error instanceof LeaderboardApplicationError;
};
