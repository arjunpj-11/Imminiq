import type { ILeaderboardActivityRepository } from '../../domain/repositories/leaderboard-activity.repository.interface'
import type { CaptureLeaderboardSnapshotResultViewDTO } from '../leaderboard.dto'
import type { ILeaderboardDateRange } from '../services/leaderboard-date-range.service'
import type { IClock } from '../../../../../shared/time/clock.interface'

export interface ICaptureLeaderboardSnapshotUseCase {
  execute(capturedAt?: Date): Promise<CaptureLeaderboardSnapshotResultViewDTO>
}

export class CaptureLeaderboardSnapshotUseCase implements ICaptureLeaderboardSnapshotUseCase {
  constructor(
    private readonly _leaderboardRepository: ILeaderboardActivityRepository,
    private readonly _dateRange: ILeaderboardDateRange,
    private readonly _clock: IClock,
  ) {}

  async execute(
    capturedAt = this._clock.now(),
  ): Promise<CaptureLeaderboardSnapshotResultViewDTO> {
    const snapshotKey = this._dateRange.toSnapshotKey(capturedAt)

    const [students, trainers] = await Promise.all([
      this._leaderboardRepository.captureRankSnapshot({
        section: 'students',
        snapshotKey,
        capturedAt,
      }),
      this._leaderboardRepository.captureRankSnapshot({
        section: 'trainers',
        snapshotKey,
        capturedAt,
      }),
    ])

    return {
      snapshotKey,
      capturedAt: capturedAt.toISOString(),
      students: students.capturedUsers,
      trainers: trainers.capturedUsers,
    }
  }
}
