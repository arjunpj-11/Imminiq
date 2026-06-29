import { User } from '../../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../../infrastructure/database/models/user-profile.model'
import type { DashboardProfileEntity } from '../../../domain/entities/dashboard-profile.entity'
import type { DashboardUserEntity } from '../../../domain/entities/dashboard-user.entity'
import type {
  MongoUserProfileRecord,
  MongoUserRecord,
} from '../shared/mongo-dashboard.types'
import { MongoDashboardBaseRepository } from '../shared/mongo-dashboard-base.repository'
import { MongoDashboardErrorMapper } from '../shared/mongo-dashboard-error.mapper'
import { MongoDashboardMapper } from '../shared/mongo-dashboard.mapper'

export class MongoDashboardUserRepository extends MongoDashboardBaseRepository {
  constructor(private readonly _mapper = new MongoDashboardMapper()) {
    super()
  }

  async findUserById(userId: string): Promise<DashboardUserEntity | null> {
    return this.execute(
      'DASHBOARD_USER_READ_FAILED',
      'Failed to read dashboard user',
      async () => {
        const user = await User.findOne({
          _id: userId,
          deletedAt: null,
        })
          .select(
            '_id fullName username avatarUrl isPremium coins lastActiveAt',
          )
          .lean<MongoUserRecord>()

        return this._mapper.toDashboardUserEntity(user)
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }

  async findProfileByUserId(
    userId: string,
  ): Promise<DashboardProfileEntity | null> {
    return this.execute(
      'DASHBOARD_PROFILE_READ_FAILED',
      'Failed to read dashboard profile',
      async () => {
        const profile = await UserProfile.findOne({
          userId,
          deletedAt: null,
        })
          .select('userId avatarUrl')
          .lean<MongoUserProfileRecord>()

        return this._mapper.toDashboardProfileEntity(profile)
      },
      MongoDashboardErrorMapper.mapMongoError,
    )
  }
}

export const mongoDashboardUserRepository = new MongoDashboardUserRepository()
