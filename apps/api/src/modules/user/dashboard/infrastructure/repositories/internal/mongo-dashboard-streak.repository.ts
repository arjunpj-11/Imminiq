import { StreakHistory } from '../../../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../../../infrastructure/database/models/streak-snapshot.model'
import { DASHBOARD_DEFAULT_ACTIVITY_MONTHS } from '../../../domain/dashboard.constants'
import type { DashboardActivityIntensityEntity } from '../../../domain/entities/dashboard-activity-intensity.entity'
import type { DashboardStreakEntity } from '../../../domain/entities/dashboard-streak.entity'
import type { GetActivityIntensityInput } from '../../../domain/repositories/dashboard-streak.repository.interface'
import type {
  MongoStreakHistoryRecord,
  MongoStreakSnapshotRecord,
} from '../shared/mongo-dashboard.types'
import { MongoDashboardBaseRepository } from '../shared/mongo-dashboard-base.repository'
import { MongoDashboardErrorMapper } from '../shared/mongo-dashboard-error.mapper'
import { MongoDashboardMapper } from '../shared/mongo-dashboard.mapper'

export class MongoDashboardStreakRepository extends MongoDashboardBaseRepository {
  constructor(private readonly _mapper = new MongoDashboardMapper()) {
    super()
  }

  async getStreakData(userId: string): Promise<DashboardStreakEntity> {
    return this.execute(
      'DASHBOARD_STREAK_READ_FAILED',
      'Failed to read dashboard streak',
      async () => {
        const streak = await StreakSnapshot.findOne({
          userId,
          deletedAt: null,
        })
          .sort({ snapshotDate: -1 })
          .select('currentStreak longestStreak snapshotDate')
          .lean<MongoStreakSnapshotRecord>()

        return this._mapper.toDashboardStreakEntity(streak)
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async getActivityIntensity(
    input: GetActivityIntensityInput,
  ): Promise<DashboardActivityIntensityEntity[]> {
    return this.execute(
      'DASHBOARD_INTENSITY_READ_FAILED',
      'Failed to read dashboard activity intensity',
      async () => {
        const { userId, months = DASHBOARD_DEFAULT_ACTIVITY_MONTHS } = input

        const fromDate = new Date()
        fromDate.setMonth(fromDate.getMonth() - months)

        const streakEntries = await StreakHistory.find({
          userId,
          date: { $gte: fromDate },
          deletedAt: null,
        })
          .sort({ date: 1 })
          .select('date activityCount intensityLevel isFrozen')
          .lean<MongoStreakHistoryRecord[]>()

        return streakEntries.map((entry) =>
          this._mapper.toDashboardActivityIntensityEntity(entry),
        )
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }
}

export const mongoDashboardStreakRepository =
  new MongoDashboardStreakRepository()
