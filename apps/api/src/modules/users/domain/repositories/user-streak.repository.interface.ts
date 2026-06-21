import type { UserStreakDayEntity } from '../entities/user-streak-day.entity'
import type { UserStreakSnapshotEntity } from '../entities/user-streak-snapshot.entity'
import type { UserIdInput } from '../value-objects/user-id.vo'

export type FindUserStreakHistoryByYearInput = {
  userId: UserIdInput
  year: number
}

export interface UserStreakRepositoryContract {
  findLatestSnapshot(
    userId: UserIdInput
  ): Promise<UserStreakSnapshotEntity | null>

  findHistoryByYear(
    input: FindUserStreakHistoryByYearInput
  ): Promise<UserStreakDayEntity[]>
}