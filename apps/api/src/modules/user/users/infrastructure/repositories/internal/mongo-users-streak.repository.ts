import { StreakHistory } from '../../../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../../../infrastructure/database/models/streak-snapshot.model'
import type { UserStreakDayEntity } from '../../../domain/entities/user-streak-day.entity'
import type { UserStreakSnapshotEntity } from '../../../domain/entities/user-streak-snapshot.entity'
import type { FindUserStreakHistoryByYearInput } from '../../../domain/repositories/users.repository.interface'
import type { UserIdInput } from '../../../domain/value-objects/user-id.vo'
import { MongoUsersBaseRepository } from '../shared/mongo-users-base.repository'
import { MongoUsersMapper } from '../shared/mongo-users.mapper'
import { MongoUsersObjectId } from '../shared/mongo-users-object-id'
import { MONGO_USERS_ACTIVE_FILTER } from '../shared/mongo-users-query.constants'
import type {
  MongoStreakHistoryRecord,
  MongoStreakSnapshotRecord,
} from '../shared/mongo-users.types'

export class MongoUsersStreakRepository extends MongoUsersBaseRepository {
  constructor(private readonly _mapper = new MongoUsersMapper()) {
    super()
  }

  async findLatestSnapshot(
    userId: UserIdInput,
  ): Promise<UserStreakSnapshotEntity | null> {
    return this.execute(
      'USER_STREAK_READ_FAILED',
      'Failed to read latest user streak snapshot',
      async () => {
        const snapshot = await StreakSnapshot.findOne({
          userId: MongoUsersObjectId.from(userId),
          ...MONGO_USERS_ACTIVE_FILTER,
        })
          .sort({
            snapshotDate: -1,
          })
          .lean<MongoStreakSnapshotRecord>()

        return snapshot ? this._mapper.toStreakSnapshotEntity(snapshot) : null
      },
    )
  }

  async findHistoryByYear(
    input: FindUserStreakHistoryByYearInput,
  ): Promise<UserStreakDayEntity[]> {
    return this.execute(
      'USER_STREAK_READ_FAILED',
      'Failed to read user streak history',
      async () => {
        const start = new Date(Date.UTC(input.year, 0, 1, 0, 0, 0))
        const end = new Date(Date.UTC(input.year + 1, 0, 1, 0, 0, 0))

        const history = await StreakHistory.find({
          userId: MongoUsersObjectId.from(input.userId),
          date: {
            $gte: start,
            $lt: end,
          },
          ...MONGO_USERS_ACTIVE_FILTER,
        })
          .sort({
            date: 1,
          })
          .lean<MongoStreakHistoryRecord[]>()

        return history.map((day) => this._mapper.toStreakDayEntity(day))
      },
    )
  }
}

export const mongoUsersStreakRepository = new MongoUsersStreakRepository()
