import { createHash } from 'crypto'

import { AuthToken } from '../../../../infrastructure/database/models/auth-token.model'
import { TwoFactorAuth } from '../../../../infrastructure/database/models/two-factor-auth.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import { SecuritySessionEntity } from '../../domain/entities/security-session.entity'
import { SecurityUserEntity } from '../../domain/entities/security-user.entity'
import { TwoFactorEntity } from '../../domain/entities/two-factor.entity'
import { SecurityDomainError } from '../../domain/errors/security-domain.error'
import type { SecurityRepositoryContract } from '../../domain/repositories/security.repository.interface'
import type { PendingEmailChangeInput } from '../../domain/repositories/security-user.repository.interface'
import type { PendingTwoFactorSetupInput } from '../../domain/repositories/security-two-factor.repository.interface'
import type { TwoFactorBackupCodeRecord } from '../../domain/value-objects/two-factor-backup-code.vo'
import type { AuthProvider } from '../../domain/value-objects/auth-provider.vo'
import type { TwoFactorStatus } from '../../domain/value-objects/two-factor-status.vo'

type MongoIdLike = { toString(): string }

type MongoSecurityUserRecord = {
  _id: MongoIdLike | string
  email?: string | null
  emailVerified?: boolean
  pendingEmail?: string | null
  provider?: string
  fullName?: string
  username?: string
  passwordHash?: string | null
}

type MongoTwoFactorRecord = {
  _id?: MongoIdLike | string
  status?: string
  totpSecretEncrypted?: string | null
}

type MongoSessionRecord = {
  _id: MongoIdLike | string
  device?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  updatedAt?: Date | null
}

export class MongoSecurityRepository implements SecurityRepositoryContract {
  async findUserById(userId: string): Promise<SecurityUserEntity | null> {
    return this.executePersistence('SECURITY_USER_LOOKUP_FAILED', async () => {
      const user = await User.findOne({ _id: userId, deletedAt: null })
        .select('+passwordHash')
        .lean<MongoSecurityUserRecord>()

      return this.toSecurityUserEntity(user)
    })
  }

  async emailExists(email: string): Promise<boolean> {
    return this.executePersistence('SECURITY_EMAIL_LOOKUP_FAILED', async () => {
      const user = await User.exists({
        email: email.toLowerCase().trim(),
        deletedAt: null,
      })

      return Boolean(user)
    })
  }

  async findUserByPendingEmailTokenHash(
    tokenHash: string,
  ): Promise<SecurityUserEntity | null> {
    return this.executePersistence('PENDING_EMAIL_LOOKUP_FAILED', async () => {
      const user = await User.findOne({
        pendingEmailChangeTokenHash: tokenHash,
        pendingEmailChangeExpiresAt: { $gt: new Date() },
        pendingEmail: { $ne: null },
        deletedAt: null,
      })
        .select('+passwordHash +pendingEmailChangeTokenHash')
        .lean<MongoSecurityUserRecord>()

      return this.toSecurityUserEntity(user)
    })
  }

  async savePendingEmailChange(
    userId: string,
    data: PendingEmailChangeInput,
  ): Promise<SecurityUserEntity | null> {
    return this.executePersistence('PENDING_EMAIL_SAVE_FAILED', async () => {
      const user = await User.findOneAndUpdate(
        { _id: userId, deletedAt: null },
        {
          $set: {
            pendingEmail: data.pendingEmail.toLowerCase().trim(),
            pendingEmailChangeTokenHash: data.tokenHash,
            pendingEmailChangeExpiresAt: data.expiresAt,
            pendingEmailChangeRequestedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )
        .select('+passwordHash')
        .lean<MongoSecurityUserRecord>()

      return this.toSecurityUserEntity(user)
    })
  }

  async confirmPendingEmailChange(
    userId: string,
    pendingEmail: string,
  ): Promise<SecurityUserEntity | null> {
    return this.executePersistence('PENDING_EMAIL_CONFIRM_FAILED', async () => {
      const normalizedEmail = pendingEmail.toLowerCase().trim()
      const user = await User.findOneAndUpdate(
        {
          _id: userId,
          pendingEmail: normalizedEmail,
          deletedAt: null,
        },
        {
          $set: { email: normalizedEmail, emailVerified: true },
          $unset: {
            pendingEmail: '',
            pendingEmailChangeTokenHash: '',
            pendingEmailChangeExpiresAt: '',
            pendingEmailChangeRequestedAt: '',
          },
        },
        { returnDocument: 'after' },
      )
        .select('+passwordHash')
        .lean<MongoSecurityUserRecord>()

      return this.toSecurityUserEntity(user)
    })
  }

  async clearPendingEmailChange(
    userId: string,
  ): Promise<SecurityUserEntity | null> {
    return this.executePersistence('PENDING_EMAIL_CLEAR_FAILED', async () => {
      const user = await User.findOneAndUpdate(
        { _id: userId, deletedAt: null },
        {
          $unset: {
            pendingEmail: '',
            pendingEmailChangeTokenHash: '',
            pendingEmailChangeExpiresAt: '',
            pendingEmailChangeRequestedAt: '',
          },
        },
        { returnDocument: 'after' },
      )
        .select('+passwordHash')
        .lean<MongoSecurityUserRecord>()

      return this.toSecurityUserEntity(user)
    })
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<SecurityUserEntity | null> {
    return this.executePersistence('PASSWORD_UPDATE_FAILED', async () => {
      const user = await User.findOneAndUpdate(
        { _id: userId, deletedAt: null },
        {
          $set: {
            passwordHash,
            passwordChangedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )
        .select('+passwordHash')
        .lean<MongoSecurityUserRecord>()

      return this.toSecurityUserEntity(user)
    })
  }

  async scheduleAccountDeletion(
    userId: string,
    scheduledDeletionAt: Date,
  ): Promise<SecurityUserEntity | null> {
    return this.executePersistence(
      'ACCOUNT_DELETION_SCHEDULE_FAILED',
      async () => {
        const user = await User.findOneAndUpdate(
          { _id: userId, deletedAt: null },
          {
            $set: {
              status: 'deactivated',
              scheduledDeletionAt,
              deactivatedAt: new Date(),
            },
          },
          { returnDocument: 'after' },
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>()

        return this.toSecurityUserEntity(user)
      },
    )
  }

  async findActiveSessions(userId: string): Promise<SecuritySessionEntity[]> {
    return this.executePersistence('SESSION_LOOKUP_FAILED', async () => {
      const sessions = await AuthToken.find({
        userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
        deletedAt: null,
      })
        .sort({ updatedAt: -1 })
        .lean<MongoSessionRecord[]>()

      return sessions.map((session) => this.toSecuritySessionEntity(session))
    })
  }

  async findCurrentRefreshTokenSession(
    refreshToken: string,
  ): Promise<SecuritySessionEntity | null> {
    return this.executePersistence(
      'CURRENT_SESSION_LOOKUP_FAILED',
      async () => {
        const session = await AuthToken.findOne({
          refreshTokenHash: this.hashToken(refreshToken),
          revokedAt: null,
          expiresAt: { $gt: new Date() },
          deletedAt: null,
        }).lean<MongoSessionRecord>()

        return session ? this.toSecuritySessionEntity(session) : null
      },
    )
  }

  async revokeSessionById(
    userId: string,
    sessionId: string,
  ): Promise<SecuritySessionEntity | null> {
    return this.executePersistence('SESSION_REVOKE_FAILED', async () => {
      const session = await AuthToken.findOneAndUpdate(
        {
          _id: sessionId,
          userId,
          revokedAt: null,
          deletedAt: null,
        },
        { $set: { revokedAt: new Date() } },
        { returnDocument: 'after' },
      ).lean<MongoSessionRecord>()

      return session ? this.toSecuritySessionEntity(session) : null
    })
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.executePersistence('SESSIONS_REVOKE_FAILED', async () => {
      await AuthToken.updateMany(
        { userId, revokedAt: null, deletedAt: null },
        { $set: { revokedAt: new Date() } },
      )
    })
  }

  async findTwoFactorByUserId(userId: string): Promise<TwoFactorEntity | null> {
    return this.executePersistence('TWO_FACTOR_LOOKUP_FAILED', async () => {
      const twoFactor = await TwoFactorAuth.findOne({
        userId,
        deletedAt: null,
      }).lean<MongoTwoFactorRecord>()

      return this.toTwoFactorEntity(twoFactor)
    })
  }

  async findTwoFactorWithSecret(
    userId: string,
  ): Promise<TwoFactorEntity | null> {
    return this.executePersistence('TWO_FACTOR_LOOKUP_FAILED', async () => {
      const twoFactor = await TwoFactorAuth.findOne({
        userId,
        deletedAt: null,
      })
        .select('+totpSecretEncrypted')
        .lean<MongoTwoFactorRecord>()

      return this.toTwoFactorEntity(twoFactor)
    })
  }

  async savePendingTwoFactorSetup(
    userId: string,
    data: PendingTwoFactorSetupInput,
  ): Promise<TwoFactorEntity | null> {
    return this.executePersistence('TWO_FACTOR_SETUP_SAVE_FAILED', async () => {
      const twoFactor = await TwoFactorAuth.findOneAndUpdate(
        { userId, deletedAt: null },
        {
          $set: {
            userId,
            status: 'pending',
            totpSecretEncrypted: data.encryptedSecret,
            issuer: data.issuer,
            accountLabel: data.accountLabel,
            qrCodeUri: data.qrCodeUri,
            backupCodes: [],
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        },
      )
        .select('+totpSecretEncrypted')
        .lean<MongoTwoFactorRecord>()

      return this.toTwoFactorEntity(twoFactor)
    })
  }

  async activateTwoFactor(
    userId: string,
    backupCodes: TwoFactorBackupCodeRecord[],
  ): Promise<TwoFactorEntity | null> {
    return this.executePersistence('TWO_FACTOR_ACTIVATE_FAILED', async () => {
      const twoFactor = await TwoFactorAuth.findOneAndUpdate(
        { userId, status: 'pending', deletedAt: null },
        {
          $set: {
            status: 'active',
            enabledAt: new Date(),
            backupCodes,
          },
        },
        { returnDocument: 'after' },
      )
        .select('+totpSecretEncrypted')
        .lean<MongoTwoFactorRecord>()

      return this.toTwoFactorEntity(twoFactor)
    })
  }

  async disableTwoFactor(userId: string): Promise<TwoFactorEntity | null> {
    return this.executePersistence('TWO_FACTOR_DISABLE_FAILED', async () => {
      const twoFactor = await TwoFactorAuth.findOneAndUpdate(
        { userId, status: 'active', deletedAt: null },
        {
          $set: {
            status: 'disabled',
            disabledAt: new Date(),
            backupCodes: [],
          },
          $unset: { totpSecretEncrypted: '', qrCodeUri: '' },
        },
        { returnDocument: 'after' },
      ).lean<MongoTwoFactorRecord>()

      return this.toTwoFactorEntity(twoFactor)
    })
  }

  private async executePersistence<T>(
    code: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new SecurityDomainError(
          'DUPLICATE_SECURITY_RECORD',
          'A security record already exists',
        )
      }

      throw new SecurityDomainError(
        code,
        'Security persistence operation failed',
      )
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    )
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  private toSecurityUserEntity(
    user: MongoSecurityUserRecord | null,
  ): SecurityUserEntity | null {
    if (!user) {
      return null
    }

    return new SecurityUserEntity({
      id: this.toId(user._id),
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      pendingEmail: user.pendingEmail,
      provider: this.toAuthProvider(user.provider),
      fullName: user.fullName ?? '',
      username: user.username ?? '',
      passwordHash: user.passwordHash,
    })
  }

  private toSecuritySessionEntity(
    session: MongoSessionRecord,
  ): SecuritySessionEntity {
    return new SecuritySessionEntity({
      id: this.toId(session._id),
      device: session.device,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      updatedAt: session.updatedAt,
    })
  }

  private toTwoFactorEntity(
    twoFactor: MongoTwoFactorRecord | null,
  ): TwoFactorEntity | null {
    if (!twoFactor) {
      return null
    }

    return new TwoFactorEntity({
      id: twoFactor._id ? this.toId(twoFactor._id) : null,
      status: this.toTwoFactorStatus(twoFactor.status),
      totpSecretEncrypted: twoFactor.totpSecretEncrypted,
    })
  }

  private toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString()
  }

  private toAuthProvider(provider?: string): AuthProvider {
    if (provider === 'google' || provider === 'github') {
      return provider
    }

    return 'local'
  }

  private toTwoFactorStatus(status?: string): TwoFactorStatus {
    if (status === 'pending' || status === 'active' || status === 'disabled') {
      return status
    }

    return 'disabled'
  }
}

export const mongoSecurityRepository = new MongoSecurityRepository()
