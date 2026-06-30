import { LeaderboardDomainError } from '../../../domain/errors/leaderboard-domain.error'
import type { MongoDuplicateKeyError } from './mongo-leaderboard.types'

export type ErrorMapper = (error: unknown) => LeaderboardDomainError | null

export class MongoLeaderboardErrorMapper {
  static mapDuplicateRecordError(
    error: unknown,
  ): LeaderboardDomainError | null {
    if (!this.isMongoDuplicateKeyError(error)) {
      return null
    }

    const duplicateKeys = {
      ...error.keyPattern,
      ...error.keyValue,
    }

    if ('idempotencyKey' in duplicateKeys) {
      return new LeaderboardDomainError(
        'XP_ACTIVITY_ALREADY_RECORDED',
        'XP activity has already been recorded',
      )
    }

    return new LeaderboardDomainError(
      'LEADERBOARD_RECORD_ALREADY_EXISTS',
      'Leaderboard record already exists',
    )
  }

  private static isMongoDuplicateKeyError(
    error: unknown,
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    )
  }
}
