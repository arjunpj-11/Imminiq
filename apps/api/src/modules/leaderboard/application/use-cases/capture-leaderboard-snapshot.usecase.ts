import type { LeaderboardActivityRepositoryContract } from '../../domain/repositories/leaderboard-activity.repository.interface'
import type { CaptureLeaderboardSnapshotResultView } from '../dtos/leaderboard.dto'
import type { LeaderboardDateRangeServiceContract } from '../services/leaderboard-date-range.service'

export class CaptureLeaderboardSnapshotUseCase {
  constructor(
    private readonly _leaderboardRepository: LeaderboardActivityRepositoryContract,
    private readonly _dateRangeService: LeaderboardDateRangeServiceContract,
  ) {}

  async execute(
    capturedAt = new Date(),
  ): Promise<CaptureLeaderboardSnapshotResultView> {
    const snapshotKey = this._dateRangeService.toSnapshotKey(capturedAt)

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
