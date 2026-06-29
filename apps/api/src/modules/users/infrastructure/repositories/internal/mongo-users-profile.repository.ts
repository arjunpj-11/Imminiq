import { UserProfile } from '../../../../../infrastructure/database/models/user-profile.model'
import { UserSettings } from '../../../../../infrastructure/database/models/user-settings.model'
import type { UserPrivacySettingsEntity } from '../../../domain/entities/user-privacy-settings.entity'
import type { UserProfileEntity } from '../../../domain/entities/user-profile.entity'
import type {
  EnsureUserProfileInput,
  UpdateUserProfileInput,
} from '../../../domain/repositories/users.repository.interface'
import type { UserIdInput } from '../../../domain/value-objects/user-id.vo'
import { MongoUsersBaseRepository } from '../shared/mongo-users-base.repository'
import { MongoUsersErrorMapper } from '../shared/mongo-users-error.mapper'
import { MongoUsersMapper } from '../shared/mongo-users.mapper'
import { MongoUsersObjectId } from '../shared/mongo-users-object-id'
import { MONGO_USERS_ACTIVE_FILTER } from '../shared/mongo-users-query.constants'
import type {
  MongoPrivacySettingsRecord,
  MongoProfileRecord,
} from '../shared/mongo-users.types'

export class MongoUsersProfileRepository extends MongoUsersBaseRepository {
  constructor(private readonly _mapper = new MongoUsersMapper()) {
    super()
  }

  async findByUserId(
    userId: UserIdInput,
  ): Promise<UserProfileEntity | null> {
    return this.execute(
      'USER_PROFILE_READ_FAILED',
      'Failed to read user profile',
      async () => {
        const profile = await UserProfile.findOne({
          userId: MongoUsersObjectId.from(userId),
          ...MONGO_USERS_ACTIVE_FILTER,
        }).lean<MongoProfileRecord>()

        return profile
          ? this._mapper.toUserProfileEntity(profile, userId)
          : null
      },
    )
  }

  async findPrivacySettings(
    userId: UserIdInput,
  ): Promise<UserPrivacySettingsEntity | null> {
    return this.execute(
      'USER_PRIVACY_READ_FAILED',
      'Failed to read user privacy settings',
      async () => {
        const settings = await UserSettings.findOne({
          userId: MongoUsersObjectId.from(userId),
          ...MONGO_USERS_ACTIVE_FILTER,
        }).lean<MongoPrivacySettingsRecord>()

        return settings ? this._mapper.toPrivacySettingsEntity(settings) : null
      },
    )
  }

  async ensureForUser(
    input: EnsureUserProfileInput,
  ): Promise<UserProfileEntity> {
    return this.execute(
      'USER_PROFILE_CREATE_FAILED',
      'Failed to ensure user profile',
      async () => {
        const id = MongoUsersObjectId.from(input.userId)

        const existing = await UserProfile.findOne({
          userId: id,
          ...MONGO_USERS_ACTIVE_FILTER,
        }).lean<MongoProfileRecord>()

        if (existing) {
          return this._mapper.toUserProfileEntity(existing, input.userId)
        }

        const created = await UserProfile.create({
          userId: id,
          fullName: input.fallbackName?.trim() ?? '',
        })

        return this._mapper.toUserProfileEntity(
          created.toObject() as MongoProfileRecord,
          input.userId,
        )
      },
      MongoUsersErrorMapper.mapDuplicateUserRecordError,
    )
  }

  async updateByUserId(
    input: UpdateUserProfileInput,
  ): Promise<UserProfileEntity | null> {
    return this.execute(
      'USER_PROFILE_UPDATE_FAILED',
      'Failed to update user profile',
      async () => {
        const id = MongoUsersObjectId.from(input.userId)

        await this.ensureForUser({
          userId: input.userId,
        })

        const profile = await UserProfile.findOneAndUpdate(
          {
            userId: id,
            ...MONGO_USERS_ACTIVE_FILTER,
          },
          {
            $set: this._mapper.toProfileUpdateData(input.payload),
          },
          {
            returnDocument: 'after',
            runValidators: true,
          },
        ).lean<MongoProfileRecord>()

        return profile
          ? this._mapper.toUserProfileEntity(profile, input.userId)
          : null
      },
      MongoUsersErrorMapper.mapDuplicateUserRecordError,
    )
  }
}

export const mongoUsersProfileRepository = new MongoUsersProfileRepository()
