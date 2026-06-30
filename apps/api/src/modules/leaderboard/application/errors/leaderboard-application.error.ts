import { LeaderboardDomainError } from '../../domain/errors/leaderboard-domain.error'

export type LeaderboardApplicationErrorCode =
  | 'INVALID_LEADERBOARD_LIMIT'
  | 'INVALID_XP_ACTIVITY'
  | 'INVALID_IDEMPOTENCY_KEY'
  | 'LEADERBOARD_USER_NOT_FOUND'
  | 'LEADERBOARD_UNAVAILABLE'
  | 'XP_ACTIVITY_CONFLICT'

export class LeaderboardApplicationError extends LeaderboardDomainError {
  readonly statusCode: number

  private constructor(
    statusCode: number,
    code: LeaderboardApplicationErrorCode,
    message: string,
  ) {
    super(code, message)
    this.name = 'LeaderboardApplicationError'
    this.statusCode = statusCode
  }

  static invalidLimit(
    message = 'Leaderboard limit is invalid',
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError(
      400,
      'INVALID_LEADERBOARD_LIMIT',
      message,
    )
  }

  static invalidXpActivity(
    message = 'XP activity is invalid',
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError(
      400,
      'INVALID_XP_ACTIVITY',
      message,
    )
  }

  static invalidIdempotencyKey(
    message = 'XP activity idempotency key is invalid',
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError(
      400,
      'INVALID_IDEMPOTENCY_KEY',
      message,
    )
  }

  static userNotFound(
    message = 'Leaderboard user not found',
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError(
      404,
      'LEADERBOARD_USER_NOT_FOUND',
      message,
    )
  }

  static unavailable(
    message = 'Leaderboard is currently unavailable',
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError(
      503,
      'LEADERBOARD_UNAVAILABLE',
      message,
    )
  }

  static xpActivityConflict(
    message = 'The idempotency key is already used by a different XP activity',
  ): LeaderboardApplicationError {
    return new LeaderboardApplicationError(
      409,
      'XP_ACTIVITY_CONFLICT',
      message,
    )
  }
}

export const isLeaderboardApplicationError = (
  error: unknown,
): error is LeaderboardApplicationError => {
  return error instanceof LeaderboardApplicationError
}
