import { User } from '../../../../../../infrastructure/database/models/user.model'
import type { UserEntity } from '../../../domain/entities/user.entity'
import type { UpdateUserFullNameInput } from '../../../domain/repositories/users.repository.interface'
import { MongoUsersBaseRepository } from '../shared/mongo-users-base.repository'
import { MongoUsersErrorMapper } from '../shared/mongo-users-error.mapper'
import { MongoUsersMapper } from '../shared/mongo-users.mapper'
import { MONGO_USERS_ACTIVE_FILTER } from '../shared/mongo-users-query.constants'
import type { MongoUserRecord } from '../shared/mongo-users.types'

const USER_SELECT =
  '_id fullName username email role status emailVerified phoneVerified onboardingCompleted coins xp level streakCount avatarUrl provider referralCode createdAt updatedAt lastActiveAt'

export class MongoUsersUserRepository extends MongoUsersBaseRepository {
  constructor(private readonly _mapper = new MongoUsersMapper()) {
    super()
  }

  async findById(userId: string): Promise<UserEntity | null> {
    return this.execute(
      'USER_READ_FAILED',
      'Failed to read user',
      async () => {
        const user = await User.findOne({
          _id: userId,
          ...MONGO_USERS_ACTIVE_FILTER,
        })
          .select(USER_SELECT)
          .lean<MongoUserRecord>()

        return user ? this._mapper.toUserEntity(user) : null
      },
    )
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.execute(
      'USER_READ_FAILED',
      'Failed to read user by username',
      async () => {
        const user = await User.findOne({
          username,
          ...MONGO_USERS_ACTIVE_FILTER,
        })
          .select(USER_SELECT)
          .lean<MongoUserRecord>()

        return user ? this._mapper.toUserEntity(user) : null
      },
    )
  }

  async updateFullName(
    input: UpdateUserFullNameInput,
  ): Promise<UserEntity | null> {
    return this.execute(
      'USER_UPDATE_FAILED',
      'Failed to update user full name',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              fullName: input.fullName.trim(),
            },
          },
          {
            returnDocument: 'after',
          },
        )
          .select(USER_SELECT)
          .lean<MongoUserRecord>()

        return user ? this._mapper.toUserEntity(user) : null
      },
      MongoUsersErrorMapper.mapDuplicateUserRecordError,
    )
  }
}

export const mongoUsersUserRepository = new MongoUsersUserRepository()
