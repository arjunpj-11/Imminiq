import { LeaderboardDomainError } from '../../domain/leaderboard-domain.error'
import type { ILeaderboardActivityRepository } from '../../domain/repositories/leaderboard-activity.repository.interface'
import type { RecordLeaderboardXpPayloadDTO } from '../leaderboard.dto'
import { LeaderboardApplicationError } from '../leaderboard-application.error'
import type { IClock } from '../../../../shared/time/clock.interface'

export interface IRecordLeaderboardXpUseCase {
  execute(payload: RecordLeaderboardXpPayloadDTO): Promise<import("../../domain/repositories/leaderboard-activity.repository.interface").RecordLeaderboardXpActivityResult>
}

export class RecordLeaderboardXpUseCase implements IRecordLeaderboardXpUseCase {
  constructor(
    private readonly _leaderboardRepository: ILeaderboardActivityRepository,
    private readonly _clock: IClock,
  ) {}

  async execute(payload: RecordLeaderboardXpPayloadDTO) {
    if (!Number.isInteger(payload.amount) || payload.amount === 0) {
      throw LeaderboardApplicationError.invalidXpActivity(
        'XP activity amount must be a non-zero integer',
      )
    }

    const idempotencyKey = payload.idempotencyKey.trim()

    if (idempotencyKey.length < 8 || idempotencyKey.length > 160) {
      throw LeaderboardApplicationError.invalidIdempotencyKey(
        'Idempotency key must contain between 8 and 160 characters',
      )
    }

    try {
      return await this._leaderboardRepository.recordXpActivity({
        userId: payload.userId,
        section: payload.section,
        amount: payload.amount,
        source: payload.source,
        idempotencyKey,
        occurredAt: payload.occurredAt ?? this._clock.now(),
        ...(payload.sourceEntityId !== undefined
          ? { sourceEntityId: payload.sourceEntityId }
          : {}),
        ...(payload.metadata !== undefined
          ? { metadata: payload.metadata }
          : {}),
      })
    } catch (error) {
      if (error instanceof LeaderboardDomainError) {
        if (error.code === 'LEADERBOARD_USER_NOT_FOUND') {
          throw LeaderboardApplicationError.userNotFound(error.message)
        }

        if (error.code === 'XP_ACTIVITY_CONFLICT') {
          throw LeaderboardApplicationError.xpActivityConflict(error.message)
        }
      }

      throw error
    }
  }
}
