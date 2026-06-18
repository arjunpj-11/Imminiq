import crypto from 'crypto'

import { User } from '../../../../infrastructure/database/models/user.model'
import { AuthToken } from '../../../../infrastructure/database/models/auth-token.model'
import { TwoFactorAuth } from '../../../../infrastructure/database/models/two-factor-auth.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'

import { OTP_EXPIRES_MINUTES } from '../../../../config/constants'
import { AuthDomainError } from '../../domain/errors/auth-domain.error'
import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import { AuthSessionEntity } from '../../domain/entities/auth-session.entity'
import { AuthUserEntity } from '../../domain/entities/auth-user.entity'
import { TwoFactorAuthEntity } from '../../domain/entities/two-factor-auth.entity'
import type { AuthRole } from '../../domain/value-objects/auth-role.vo'
import type { UserStatus } from '../../domain/value-objects/user-status.vo'
import type { TwoFactorStatus } from '../../domain/value-objects/two-factor-status.vo'

type MongoIdLike = {
  toString(): string
}

type MongoAuthUserRecord = {
  _id: MongoIdLike
  fullName: string
  username: string
  email?: string
  phone?: string
  role: AuthRole
  status: UserStatus
  emailVerified?: boolean
  phoneVerified?: boolean
  isPremium?: boolean
  avatarUrl?: string | null
  onboardingCompleted?: boolean
  passwordHash?: string | null
  scheduledDeletionAt?: Date | string | null
}

type MongoAuthSessionRecord = {
  _id: MongoIdLike
  userId: MongoIdLike | string
  refreshTokenHash?: string
  expiresAt: Date
  revokedAt?: Date | null
  deletedAt?: Date | null
  device?: string
  ipAddress?: string
  userAgent?: string
  createdAt?: Date
  updatedAt?: Date
}

type MongoTwoFactorAuthRecord = {
  _id: MongoIdLike
  userId: MongoIdLike | string
  status: TwoFactorStatus
  totpSecretEncrypted: string
  backupCodes?: Array<{
    codeHash: string
    usedAt?: Date | null
  }>
}

type MongooseObjectLike<T> = {
  toObject(): T
}

type MongoDuplicateKeyError = {
  code: 11000
  keyPattern?: Record<string, unknown>
  keyValue?: Record<string, unknown>
}

const REFRESH_TOKEN_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000

const toId = (value: MongoIdLike | string): string => {
  return typeof value === 'string' ? value : value.toString()
}

export class MongoAuthRepository implements AuthRepositoryContract {
  async findByEmail(email: string) {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      deletedAt: null,
    })
      .select('+passwordHash')
      .lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async findByPhone(phone: string) {
    const user = await User.findOne({
      phone: this.normalizePhone(phone),
      deletedAt: null,
    })
      .select('+passwordHash')
      .lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async findByIdentifier(identifier: string) {
    const value = identifier.trim()
    const isEmail = value.includes('@')

    const user = await User.findOne({
      ...(isEmail
        ? { email: value.toLowerCase() }
        : { phone: this.normalizePhone(value) }),
      deletedAt: null,
    })
      .select('+passwordHash')
      .lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async findById(id: string) {
    const user = await User.findOne({
      _id: id,
      deletedAt: null,
    })
      .select('+passwordHash')
      .lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async findByUsername(username: string) {
    const user = await User.findOne({
      username: username.toLowerCase().trim(),
      deletedAt: null,
    }).lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async emailExists(email: string) {
    return !!(await User.exists({
      email: email.toLowerCase().trim(),
    }))
  }

  async phoneExists(phone: string) {
    return !!(await User.exists({
      phone: this.normalizePhone(phone),
    }))
  }

  async usernameExists(username: string) {
    return !!(await User.exists({
      username: username.toLowerCase().trim(),
    }))
  }

  async createUser(data: {
    fullName: string
    email?: string
    phone?: string
    username: string
    passwordHash: string
  }) {
    try {
      const user = await User.create({
        fullName: data.fullName.trim(),
        ...(data.email
          ? { email: data.email.toLowerCase().trim() }
          : {}),
        ...(data.phone
          ? { phone: this.normalizePhone(data.phone) }
          : {}),
        username: data.username.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        provider: 'local',
        emailVerified: false,
        phoneVerified: false,
        verificationExpiresAt: new Date(
          Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000
        ),
      })

      return this.toAuthUserEntityOrThrow(
        this.toPlainRecord<MongoAuthUserRecord>(user)
      )
    } catch (error) {
      this.throwMappedDuplicateUserError(error)
    }
  }

  async createOAuthUser(data: {
    fullName: string
    email: string
    username: string
    avatarUrl?: string
    provider: 'google' | 'github'
    providerId: string
  }) {
    const normalizedEmail = data.email.toLowerCase().trim()

    const existingUser = await User.findOne({
      email: normalizedEmail,
    })
      .select('+passwordHash')
      .lean<MongoAuthUserRecord & {
        provider?: string | null
        providerId?: string | null
      }>()

    if (existingUser) {
      const updatedUser = await User.findByIdAndUpdate(
        existingUser._id,
        {
          $set: {
            fullName: existingUser.fullName || data.fullName.trim(),
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
        }
      )
        .select('+passwordHash')
        .lean<MongoAuthUserRecord>()

      if (updatedUser) {
        await this.ensureUserProfile(updatedUser)

        return this.toAuthUserEntityOrThrow(updatedUser)
      }
    }

    try {
      const user = await User.create({
        fullName: data.fullName.trim(),
        email: normalizedEmail,
        username: data.username.toLowerCase().trim(),
        ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
        provider: data.provider,
        providerId: data.providerId,
        emailVerified: true,
        phoneVerified: false,
        passwordHash: null,
        verificationExpiresAt: null,
      })

      const plainUser = this.toPlainRecord<MongoAuthUserRecord>(user)

      await this.ensureUserProfile(plainUser)

      return this.toAuthUserEntityOrThrow(plainUser)
    } catch (error) {
      this.throwMappedDuplicateUserError(error)
    }
  }

  async updateProfile(
    id: string,
    data: {
      fullName?: string
      username?: string
      avatarUrl?: string
    }
  ) {
    try {
      const user = await User.findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
        },
        {
          ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
          ...(data.username
            ? { username: data.username.toLowerCase().trim() }
            : {}),
          ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
        },
        {
          returnDocument: 'after',
        }
      ).lean<MongoAuthUserRecord>()

      return this.toAuthUserEntity(user)
    } catch (error) {
      this.throwMappedDuplicateUserError(error)
    }
  }

  async updateUser(id: string, data: Record<string, unknown>) {
    const user = await User.findByIdAndUpdate(
      id,
      data,
      {
        returnDocument: 'after',
      }
    ).lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async markEmailVerified(id: string) {
    const user = await User.findByIdAndUpdate(
      id,
      {
        emailVerified: true,
        verificationExpiresAt: null,
      },
      {
        returnDocument: 'after',
      }
    ).lean<MongoAuthUserRecord>()

    if (user) {
      await this.ensureUserProfile(user)
    }

    return this.toAuthUserEntity(user)
  }

  async markPhoneVerified(id: string) {
    const user = await User.findByIdAndUpdate(
      id,
      {
        phoneVerified: true,
        verificationExpiresAt: null,
      },
      {
        returnDocument: 'after',
      }
    ).lean<MongoAuthUserRecord>()

    if (user) {
      await this.ensureUserProfile(user)
    }

    return this.toAuthUserEntity(user)
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    const user = await User.findByIdAndUpdate(
      id,
      {
        passwordHash,
      },
      {
        returnDocument: 'after',
      }
    ).lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async updateLastActive(id: string) {
    const user = await User.findByIdAndUpdate(
      id,
      {
        lastActiveAt: new Date(),
      },
      {
        returnDocument: 'after',
      }
    ).lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async cancelScheduledDeletionIfRecoverable(id: string) {
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
      }
    ).lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async deleteUserById(id: string) {
    const user = await User.findByIdAndDelete(id).lean<MongoAuthUserRecord>()

    return this.toAuthUserEntity(user)
  }

  async hasActiveTwoFactor(userId: string) {
    return !!(await TwoFactorAuth.exists({
      userId,
      status: 'active',
      deletedAt: null,
    }))
  }

  async findActiveTwoFactorForLogin(userId: string) {
    const twoFactor = await TwoFactorAuth.findOne({
      userId,
      status: 'active',
      deletedAt: null,
    })
      .select('+totpSecretEncrypted +backupCodes +backupCodes.codeHash')
      .lean<MongoTwoFactorAuthRecord>()

    return this.toTwoFactorAuthEntity(twoFactor)
  }

  async touchTwoFactorLastUsed(userId: string) {
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
      }
    ).lean<MongoTwoFactorAuthRecord>()

    return this.toTwoFactorAuthEntity(twoFactor)
  }

  async markBackupCodeUsed(userId: string, backupCodeIndex: number) {
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
      }
    ).lean<MongoTwoFactorAuthRecord>()

    return this.toTwoFactorAuthEntity(twoFactor)
  }

  async saveRefreshToken(data: {
    userId: string
    refreshToken: string
    device?: string
    ipAddress?: string
    userAgent?: string
  }) {
    const refreshTokenHash = this.hashToken(data.refreshToken)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS)

    const session = await AuthToken.create({
      userId: data.userId,
      refreshTokenHash,
      ...(data.device ? { device: data.device } : {}),
      ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
      ...(data.userAgent ? { userAgent: data.userAgent } : {}),
      expiresAt,
    })

    return this.toAuthSessionEntityOrThrow(
      this.toPlainRecord<MongoAuthSessionRecord>(session)
    )
  }

  async findRefreshToken(refreshToken: string) {
    const refreshTokenHash = this.hashToken(refreshToken)

    const session = await AuthToken.findOne({
      refreshTokenHash,
      expiresAt: {
        $gt: new Date(),
      },
      revokedAt: null,
      deletedAt: null,
    }).lean<MongoAuthSessionRecord>()

    return this.toAuthSessionEntity(session)
  }

  async rotateRefreshTokenInSameSession(
    sessionId: string,
    newRefreshToken: string,
    meta?: {
      device?: string
      ipAddress?: string
      userAgent?: string
    }
  ) {
    const refreshTokenHash = this.hashToken(newRefreshToken)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS)

    const sessionMetaUpdate = {
      ...(meta?.device ? { device: meta.device } : {}),
      ...(meta?.ipAddress ? { ipAddress: meta.ipAddress } : {}),
      ...(meta?.userAgent ? { userAgent: meta.userAgent } : {}),
    }

    const session = await AuthToken.findOneAndUpdate(
      {
        _id: sessionId,
        revokedAt: null,
        deletedAt: null,
      },
      {
        $set: {
          refreshTokenHash,
          expiresAt,
          ...sessionMetaUpdate,
        },
      },
      {
        returnDocument: 'after',
      }
    ).lean<MongoAuthSessionRecord>()

    return this.toAuthSessionEntity(session)
  }

  async findAllUserTokens(userId: string) {
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
      this.toAuthSessionEntityOrThrow(session)
    )
  }

  async revokeRefreshToken(refreshToken: string) {
    const refreshTokenHash = this.hashToken(refreshToken)

    const result = await AuthToken.findOneAndUpdate(
      {
        refreshTokenHash,
        revokedAt: null,
        deletedAt: null,
      },
      {
        revokedAt: new Date(),
      },
      {
        returnDocument: 'after',
      }
    ).lean<MongoAuthSessionRecord>()

    return !!result
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await AuthToken.updateMany(
      {
        userId,
        revokedAt: null,
        deletedAt: null,
      },
      {
        revokedAt: new Date(),
      }
    )
  }

  async revokeSessionById(sessionId: string, userId: string) {
    const session = await AuthToken.findOneAndUpdate(
      {
        _id: sessionId,
        userId,
        revokedAt: null,
        deletedAt: null,
      },
      {
        revokedAt: new Date(),
      },
      {
        returnDocument: 'after',
      }
    ).lean<MongoAuthSessionRecord>()

    return this.toAuthSessionEntity(session)
  }

  private throwMappedDuplicateUserError(error: unknown): never {
    if (!this.isMongoDuplicateKeyError(error)) {
      throw new AuthDomainError(
        'PERSISTENCE_ERROR',
        'Auth persistence failed'
      )
    }

    const duplicateKeys = {
      ...error.keyPattern,
      ...error.keyValue,
    }

    if ('email' in duplicateKeys) {
      throw new AuthDomainError(
        'EMAIL_TAKEN',
        'Email already in use'
      )
    }

    if ('phone' in duplicateKeys) {
      throw new AuthDomainError(
        'PHONE_TAKEN',
        'Phone already in use'
      )
    }

    if ('username' in duplicateKeys) {
      throw new AuthDomainError(
        'USERNAME_TAKEN',
        'Username already in use'
      )
    }

    throw new AuthDomainError(
      'AUTH_IDENTIFIER_TAKEN',
      'Account identifier already in use'
    )
  }

  private isMongoDuplicateKeyError(
    error: unknown
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    )
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  private normalizePhone(phone: string): string {
    return phone.trim().replace(/\s/g, '')
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
      }
    )
  }

  private toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject()
  }

  private toAuthUserEntity(
    user: MongoAuthUserRecord | null
  ): AuthUserEntity | null {
    if (!user) {
      return null
    }

    return new AuthUserEntity({
      id: toId(user._id),
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      status: user.status,
      emailVerified: Boolean(user.emailVerified),
      phoneVerified: Boolean(user.phoneVerified),
      isPremium: Boolean(user.isPremium),
      onboardingCompleted: Boolean(user.onboardingCompleted),
      ...(user.email !== undefined ? { email: user.email } : {}),
      ...(user.phone !== undefined ? { phone: user.phone } : {}),
      ...(user.avatarUrl !== undefined
        ? { avatarUrl: user.avatarUrl }
        : {}),
      ...(user.passwordHash !== undefined
        ? { passwordHash: user.passwordHash }
        : {}),
      ...(user.scheduledDeletionAt !== undefined
        ? { scheduledDeletionAt: user.scheduledDeletionAt }
        : {}),
    })
  }

  private toAuthUserEntityOrThrow(
    user: MongoAuthUserRecord | null
  ): AuthUserEntity {
    const entity = this.toAuthUserEntity(user)

    if (!entity) {
      throw new AuthDomainError(
        'AUTH_USER_MAPPING_FAILED',
        'Failed to map auth user'
      )
    }

    return entity
  }

  private toAuthSessionEntity(
    session: MongoAuthSessionRecord | null
  ): AuthSessionEntity | null {
    if (!session) {
      return null
    }

    return new AuthSessionEntity({
      id: toId(session._id),
      userId: toId(session.userId),
      expiresAt: session.expiresAt,
      ...(session.refreshTokenHash !== undefined
        ? { refreshTokenHash: session.refreshTokenHash }
        : {}),
      ...(session.revokedAt !== undefined
        ? { revokedAt: session.revokedAt }
        : {}),
      ...(session.deletedAt !== undefined
        ? { deletedAt: session.deletedAt }
        : {}),
      ...(session.device !== undefined ? { device: session.device } : {}),
      ...(session.ipAddress !== undefined
        ? { ipAddress: session.ipAddress }
        : {}),
      ...(session.userAgent !== undefined
        ? { userAgent: session.userAgent }
        : {}),
      ...(session.createdAt !== undefined
        ? { createdAt: session.createdAt }
        : {}),
    })
  }

  private toAuthSessionEntityOrThrow(
    session: MongoAuthSessionRecord | null
  ): AuthSessionEntity {
    const entity = this.toAuthSessionEntity(session)

    if (!entity) {
      throw new AuthDomainError(
        'AUTH_SESSION_MAPPING_FAILED',
        'Failed to map auth session'
      )
    }

    return entity
  }

  private toTwoFactorAuthEntity(
    twoFactor: MongoTwoFactorAuthRecord | null
  ): TwoFactorAuthEntity | null {
    if (!twoFactor) {
      return null
    }

    return new TwoFactorAuthEntity({
      id: toId(twoFactor._id),
      userId: toId(twoFactor.userId),
      status: twoFactor.status,
      totpSecretEncrypted: twoFactor.totpSecretEncrypted,
      backupCodes: twoFactor.backupCodes ?? [],
    })
  }
}

export const mongoAuthRepository = new MongoAuthRepository()