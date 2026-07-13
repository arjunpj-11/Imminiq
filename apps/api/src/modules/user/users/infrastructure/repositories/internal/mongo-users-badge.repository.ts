import { Badge } from '../../../../../../infrastructure/database/models/badge.model'
import { UserBadge } from '../../../../../../infrastructure/database/models/user-badge.model'
import type { EarnedUserBadgeEntity } from '../../../domain/entities/earned-user-badge.entity'
import type { UserBadgeEntity } from '../../../domain/entities/user-badge.entity'
import type { FindEarnedUserBadgesPaginatedInput } from '../../../domain/repositories/users.repository.interface'
import type { UserIdInput } from '../../../domain/value-objects/user-id.vo'
import { MongoUsersBaseRepository } from '../shared/mongo-users-base.repository'
import { MongoUsersMapper } from '../shared/mongo-users.mapper'
import { MongoUsersObjectId } from '../shared/mongo-users-object-id'
import { MONGO_USERS_ACTIVE_FILTER } from '../shared/mongo-users-query.constants'
import type {
  MongoBadgeRecord,
  MongoEarnedBadgeRecord,
} from '../shared/mongo-users.types'

export class MongoUsersBadgeRepository extends MongoUsersBaseRepository {
  constructor(private readonly _mapper = new MongoUsersMapper()) {
    super()
  }

  async findBadgeShowcase(userId: UserIdInput): Promise<{
    catalog: UserBadgeEntity[]
    earned: EarnedUserBadgeEntity[]
  }> {
    return this.execute(
      'USER_BADGE_READ_FAILED',
      'Failed to read user badge showcase',
      async () => {
        const id = MongoUsersObjectId.from(userId)

        const [catalog, earned] = await Promise.all([
          Badge.find(MONGO_USERS_ACTIVE_FILTER)
            .sort({
              createdAt: 1,
            })
            .lean<MongoBadgeRecord[]>(),
          UserBadge.find({
            userId: id,
            ...MONGO_USERS_ACTIVE_FILTER,
          })
            .populate('badgeId')
            .lean<MongoEarnedBadgeRecord[]>(),
        ])

        return {
          catalog: catalog.map((badge) =>
            this._mapper.toUserBadgeEntity(badge),
          ),
          earned: earned.map((item) =>
            this._mapper.toEarnedUserBadgeEntity(item),
          ),
        }
      },
    )
  }

  async findEarnedBadgesPaginated(
    input: FindEarnedUserBadgesPaginatedInput,
  ): Promise<{ items: EarnedUserBadgeEntity[]; total: number }> {
    return this.execute(
      'USER_BADGE_READ_FAILED',
      'Failed to read earned user badges',
      async () => {
        const { userId, page = 1, limit = 10 } = input
        const skip = (page - 1) * limit

        const filter = {
          userId: MongoUsersObjectId.from(userId),
          ...MONGO_USERS_ACTIVE_FILTER,
        }

        const [items, total] = await Promise.all([
          UserBadge.find(filter)
            .populate('badgeId')
            .sort({
              earnedAt: -1,
            })
            .skip(skip)
            .limit(limit)
            .lean<MongoEarnedBadgeRecord[]>(),
          UserBadge.countDocuments(filter),
        ])

        return {
          items: items.map((item) =>
            this._mapper.toEarnedUserBadgeEntity(item),
          ),
          total,
        }
      },
    )
  }
}

export const mongoUsersBadgeRepository = new MongoUsersBadgeRepository()
