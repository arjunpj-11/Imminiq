import { OTP_EXPIRES_MINUTES } from '../../../../config/constants'
import { AuthToken } from '../../../../infrastructure/database/models/auth-token.model'
import { TwoFactorAuth } from '../../../../infrastructure/database/models/two-factor-auth.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'
import type {
  RotateAuthSessionInput,
  SaveAuthSessionInput,
} from '../../domain/repositories/auth-session.repository.interface'
import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import type {
  CreateAuthUserInput,
  CreateOAuthUserInput,
  UpdateAuthProfileInput,
  UpdateAuthUserInput,
} from '../../domain/repositories/auth-user.repository.interface'
import { MongoAuthBaseRepository } from './mongo-auth-base.repository'
import { MongoAuthErrorMapper } from './mongo-auth-error.mapper'
import { MongoAuthMapper } from './mongo-auth.mapper'
import type {
  MongoAuthSessionRecord,
  MongoAuthUserRecord,
  MongoIdLike,
  MongoOAuthAuthUserRecord,
  MongoTwoFactorAuthRecord,
} from './mongo-auth.types'

const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000

export class MongoAuthRepository
  extends MongoAuthBaseRepository
  implements AuthRepositoryContract
{
  constructor(private readonly _mapper = new MongoAuthMapper()) {
    super()
  }

  async findByEmail(email: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to read auth user by email',
      async () => {
        const user = await User.findOne({
          email: this.normalizeEmail(email),
          deletedAt: null,
        })
          .select('+passwordHash')
          .lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async findByPhone(phone: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to read auth user by phone',
      async () => {
        const user = await User.findOne({
          phone: this.normalizePhone(phone),
          deletedAt: null,
        })
          .select('+passwordHash')
          .lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async findByIdentifier(identifier: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to read auth user by identifier',
      async () => {
        const value = identifier.trim()
        const isEmail = value.includes('@')

        const user = await User.findOne({
          ...(isEmail
            ? { email: this.normalizeEmail(value) }
            : { phone: this.normalizePhone(value) }),
          deletedAt: null,
        })
          .select('+passwordHash')
          .lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async findById(id: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to read auth user by id',
      async () => {
        const user = await User.findOne({
          _id: id,
          deletedAt: null,
        })
          .select('+passwordHash')
          .lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async findByUsername(username: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to read auth user by username',
      async () => {
        const user = await User.findOne({
          username: this.normalizeUsername(username),
          deletedAt: null,
        }).lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async emailExists(email: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to check email availability',
      async () =>
        Boolean(
          await User.exists({
            email: this.normalizeEmail(email),
            deletedAt: null,
          }),
        ),
    )
  }

  async phoneExists(phone: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to check phone availability',
      async () =>
        Boolean(
          await User.exists({
            phone: this.normalizePhone(phone),
            deletedAt: null,
          }),
        ),
    )
  }

  async usernameExists(username: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to check username availability',
      async () =>
        Boolean(
          await User.exists({
            username: this.normalizeUsername(username),
            deletedAt: null,
          }),
        ),
    )
  }

  async createUser(data: CreateAuthUserInput) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to create auth user',
      async () => {
        const user = await User.create({
          fullName: this.normalizeText(data.fullName),
          ...(data.email ? { email: this.normalizeEmail(data.email) } : {}),
          ...(data.phone ? { phone: this.normalizePhone(data.phone) } : {}),
          username: this.normalizeUsername(data.username),
          passwordHash: data.passwordHash,
          provider: 'local',
          emailVerified: false,
          phoneVerified: false,
          verificationExpiresAt: new Date(
            Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000,
          ),
        })

        return this._mapper.toAuthUserEntityOrThrow(
          this._mapper.toPlainRecord<MongoAuthUserRecord>(user),
        )
      },
      MongoAuthErrorMapper.mapDuplicateUserError,
    )
  }

  async createOAuthUser(data: CreateOAuthUserInput) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to create OAuth user',
      async () => {
        const normalizedEmail = this.normalizeEmail(data.email)

        const existingUser = await User.findOne({
          email: normalizedEmail,
        })
          .select('+passwordHash')
          .lean<MongoOAuthAuthUserRecord>()

        if (existingUser) {
          const updatedUser = await User.findByIdAndUpdate(
            existingUser._id,
            {
              $set: {
                fullName:
                  existingUser.fullName || this.normalizeText(data.fullName),
                avatarUrl: existingUser.avatarUrl || data.avatarUrl,
                provider: existingUser.provider || data.provider,
                providerId: existingUser.providerId || data.providerId,
                emailVerified: true,
                verificationExpiresAt: null,
                deletedAt: null,
              },
            },
            {
              returnDocument: 'after',
            },
          )
            .select('+passwordHash')
            .lean<MongoAuthUserRecord>()

          if (updatedUser) {
            await this.ensureUserProfile(updatedUser)

            return this._mapper.toAuthUserEntityOrThrow(updatedUser)
          }
        }

        const user = await User.create({
          fullName: this.normalizeText(data.fullName),
          email: normalizedEmail,
          username: this.normalizeUsername(data.username),
          ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
          provider: data.provider,
          providerId: data.providerId,
          emailVerified: true,
          phoneVerified: false,
          passwordHash: null,
          verificationExpiresAt: null,
        })

        const plainUser = this._mapper.toPlainRecord<MongoAuthUserRecord>(user)

        await this.ensureUserProfile(plainUser)

        return this._mapper.toAuthUserEntityOrThrow(plainUser)
      },
      MongoAuthErrorMapper.mapDuplicateUserError,
    )
  }

  async updateProfile(id: string, data: UpdateAuthProfileInput) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to update auth profile',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: id,
            deletedAt: null,
          },
          {
            $set: {
              ...(data.fullName
                ? { fullName: this.normalizeText(data.fullName) }
                : {}),
              ...(data.username
                ? { username: this.normalizeUsername(data.username) }
                : {}),
              ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
      MongoAuthErrorMapper.mapDuplicateUserError,
    )
  }

  async updateUser(id: string, data: UpdateAuthUserInput) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to update auth user',
      async () => {
        const update = this.buildUserUpdate(data)

        if (Object.keys(update.$set).length === 0) {
          const user = await User.findOne({
            _id: id,
            deletedAt: null,
          }).lean<MongoAuthUserRecord>()

          return this._mapper.toAuthUserEntity(user)
        }

        const user = await User.findOneAndUpdate(
          {
            _id: id,
            deletedAt: null,
          },
          update,
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
      MongoAuthErrorMapper.mapDuplicateUserError,
    )
  }

  async markEmailVerified(id: string) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to mark email verified',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: id,
            deletedAt: null,
          },
          {
            $set: {
              emailVerified: true,
              verificationExpiresAt: null,
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthUserRecord>()

        if (user) {
          await this.ensureUserProfile(user)
        }

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async markPhoneVerified(id: string) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to mark phone verified',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: id,
            deletedAt: null,
          },
          {
            $set: {
              phoneVerified: true,
              verificationExpiresAt: null,
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthUserRecord>()

        if (user) {
          await this.ensureUserProfile(user)
        }

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to update password hash',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: id,
            deletedAt: null,
          },
          {
            $set: {
              passwordHash,
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async updateLastActive(id: string) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to update last active time',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: id,
            deletedAt: null,
          },
          {
            $set: {
              lastActiveAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async cancelScheduledDeletionIfRecoverable(id: string) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to cancel scheduled account deletion',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: id,
            status: 'deactivated',
            deletedAt: null,
            scheduledDeletionAt: {
              $gt: new Date(),
            },
          },
          {
            $set: {
              status: 'active',
            },
            $unset: {
              deletionRequestedAt: '',
              scheduledDeletionAt: '',
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async deleteUserById(id: string) {
    return this.execute(
      'AUTH_USER_DELETE_FAILED',
      'Failed to delete auth user',
      async () => {
        const user = await User.findByIdAndDelete(id).lean<MongoAuthUserRecord>()

        return this._mapper.toAuthUserEntity(user)
      },
    )
  }

  async hasActiveTwoFactor(userId: string) {
    return this.execute(
      'AUTH_TWO_FACTOR_READ_FAILED',
      'Failed to check active two-factor auth',
      async () =>
        Boolean(
          await TwoFactorAuth.exists({
            userId,
            status: 'active',
            deletedAt: null,
          }),
        ),
    )
  }

  async findActiveTwoFactorForLogin(userId: string) {
    return this.execute(
      'AUTH_TWO_FACTOR_READ_FAILED',
      'Failed to read active two-factor auth',
      async () => {
        const twoFactor = await TwoFactorAuth.findOne({
          userId,
          status: 'active',
          deletedAt: null,
        })
          .select('+totpSecretEncrypted +backupCodes +backupCodes.codeHash')
          .lean<MongoTwoFactorAuthRecord>()

        return this._mapper.toTwoFactorAuthEntity(twoFactor)
      },
    )
  }

  async touchTwoFactorLastUsed(userId: string) {
    return this.execute(
      'AUTH_TWO_FACTOR_WRITE_FAILED',
      'Failed to update two-factor last used time',
      async () => {
        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId,
            status: 'active',
            deletedAt: null,
          },
          {
            $set: {
              lastUsedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoTwoFactorAuthRecord>()

        return this._mapper.toTwoFactorAuthEntity(twoFactor)
      },
    )
  }

  async markBackupCodeUsed(userId: string, backupCodeIndex: number) {
    return this.execute(
      'AUTH_TWO_FACTOR_WRITE_FAILED',
      'Failed to mark backup code used',
      async () => {
        const usedAtPath = `backupCodes.${backupCodeIndex}.usedAt`

        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId,
            status: 'active',
            deletedAt: null,
            [usedAtPath]: null,
          },
          {
            $set: {
              [usedAtPath]: new Date(),
              lastUsedAt: new Date(),
            },
            $inc: {
              backupCodesUsed: 1,
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoTwoFactorAuthRecord>()

        return this._mapper.toTwoFactorAuthEntity(twoFactor)
      },
    )
  }

  async saveSession(data: SaveAuthSessionInput) {
    return this.execute(
      'AUTH_SESSION_WRITE_FAILED',
      'Failed to save auth session',
      async () => {
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS)

        const session = await AuthToken.create({
          userId: data.userId,
          refreshTokenHash: data.refreshTokenHash,
          ...(data.device ? { device: data.device } : {}),
          ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
          ...(data.userAgent ? { userAgent: data.userAgent } : {}),
          expiresAt,
        })

        return this._mapper.toAuthSessionEntityOrThrow(
          this._mapper.toPlainRecord<MongoAuthSessionRecord>(session),
        )
      },
    )
  }

  async findSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this.execute(
      'AUTH_SESSION_READ_FAILED',
      'Failed to read refresh token session',
      async () => {
        const session = await AuthToken.findOne({
          refreshTokenHash,
          expiresAt: {
            $gt: new Date(),
          },
          revokedAt: null,
          deletedAt: null,
        }).lean<MongoAuthSessionRecord>()

        return this._mapper.toAuthSessionEntity(session)
      },
    )
  }

  async rotateRefreshTokenInSameSession(data: RotateAuthSessionInput) {
    return this.execute(
      'AUTH_SESSION_WRITE_FAILED',
      'Failed to rotate refresh token session',
      async () => {
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS)
        const sessionMetaUpdate = {
          ...(data.meta?.device ? { device: data.meta.device } : {}),
          ...(data.meta?.ipAddress ? { ipAddress: data.meta.ipAddress } : {}),
          ...(data.meta?.userAgent ? { userAgent: data.meta.userAgent } : {}),
        }

        const session = await AuthToken.findOneAndUpdate(
          {
            _id: data.sessionId,
            revokedAt: null,
            deletedAt: null,
          },
          {
            $set: {
              refreshTokenHash: data.newRefreshTokenHash,
              expiresAt,
              ...sessionMetaUpdate,
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthSessionRecord>()

        return this._mapper.toAuthSessionEntity(session)
      },
    )
  }

  async findAllUserSessions(userId: string) {
    return this.execute(
      'AUTH_SESSION_READ_FAILED',
      'Failed to read user sessions',
      async () => {
        const sessions = await AuthToken.find({
          userId,
          expiresAt: {
            $gt: new Date(),
          },
          revokedAt: null,
          deletedAt: null,
        })
          .sort({
            createdAt: -1,
          })
          .lean<MongoAuthSessionRecord[]>()

        return sessions.map((session) =>
          this._mapper.toAuthSessionEntityOrThrow(session),
        )
      },
    )
  }

  async revokeSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this.execute(
      'AUTH_SESSION_WRITE_FAILED',
      'Failed to revoke refresh token session',
      async () => {
        const session = await AuthToken.findOneAndUpdate(
          {
            refreshTokenHash,
            revokedAt: null,
            deletedAt: null,
          },
          {
            $set: {
              revokedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthSessionRecord>()

        return Boolean(session)
      },
    )
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.execute(
      'AUTH_SESSION_WRITE_FAILED',
      'Failed to revoke all user sessions',
      async () => {
        await AuthToken.updateMany(
          {
            userId,
            revokedAt: null,
            deletedAt: null,
          },
          {
            $set: {
              revokedAt: new Date(),
            },
          },
        )
      },
    )
  }

  async revokeSessionById(sessionId: string, userId: string) {
    return this.execute(
      'AUTH_SESSION_WRITE_FAILED',
      'Failed to revoke session',
      async () => {
        const session = await AuthToken.findOneAndUpdate(
          {
            _id: sessionId,
            userId,
            revokedAt: null,
            deletedAt: null,
          },
          {
            $set: {
              revokedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoAuthSessionRecord>()

        return this._mapper.toAuthSessionEntity(session)
      },
    )
  }

  private buildUserUpdate(data: UpdateAuthUserInput): {
    $set: Record<string, unknown>
  } {
    const $set: Record<string, unknown> = {}

    if (data.fullName !== undefined) {
      $set.fullName = this.normalizeText(data.fullName)
    }

    if (data.email !== undefined) {
      $set.email = this.normalizeEmail(data.email)
    }

    if (data.phone !== undefined) {
      $set.phone = this.normalizePhone(data.phone)
    }

    if (data.username !== undefined) {
      $set.username = this.normalizeUsername(data.username)
    }

    if (data.avatarUrl !== undefined) {
      $set.avatarUrl = data.avatarUrl
    }

    if (data.passwordHash !== undefined) {
      $set.passwordHash = data.passwordHash
    }

    if (data.emailVerified !== undefined) {
      $set.emailVerified = data.emailVerified
    }

    if (data.phoneVerified !== undefined) {
      $set.phoneVerified = data.phoneVerified
    }

    if (data.onboardingCompleted !== undefined) {
      $set.onboardingCompleted = data.onboardingCompleted
    }

    if (data.lastActiveAt !== undefined) {
      $set.lastActiveAt = data.lastActiveAt
    }

    if (data.status !== undefined) {
      $set.status = data.status
    }

    if (data.scheduledDeletionAt !== undefined) {
      $set.scheduledDeletionAt = data.scheduledDeletionAt
    }

    return {
      $set,
    }
  }

  private async ensureUserProfile(user: {
    _id: MongoIdLike
    fullName: string
  }) {
    await UserProfile.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        $setOnInsert: {
          userId: user._id,
          fullName: user.fullName,
          publicProfileEnabled: true,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    )
  }
}

export const mongoAuthRepository = new MongoAuthRepository()