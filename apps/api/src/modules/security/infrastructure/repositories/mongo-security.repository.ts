import { AuthToken } from '../../../../infrastructure/database/models/auth-token.model'
import { TwoFactorAuth } from '../../../../infrastructure/database/models/two-factor-auth.model'
import { User } from '../../../../infrastructure/database/models/user.model'
import type { RevokeSecuritySessionInput } from '../../domain/repositories/security-session.repository.interface'
import type { SecurityRepositoryContract } from '../../domain/repositories/security.repository.interface'
import type {
  ActivateTwoFactorInput,
  SavePendingTwoFactorSetupInput,
} from '../../domain/repositories/security-two-factor.repository.interface'
import type {
  ConfirmPendingEmailChangeInput,
  SavePendingEmailChangeInput,
  ScheduleAccountDeletionInput,
  UpdateSecurityPasswordHashInput,
} from '../../domain/repositories/security-user.repository.interface'
import { MongoSecurityBaseRepository } from './mongo-security-base.repository'
import { MongoSecurityErrorMapper } from './mongo-security-error.mapper'
import { MongoSecurityMapper } from './mongo-security.mapper'
import type {
  MongoSecuritySessionRecord,
  MongoSecurityUserRecord,
  MongoTwoFactorRecord,
} from './mongo-security.types'

export class MongoSecurityRepository
  extends MongoSecurityBaseRepository
  implements SecurityRepositoryContract
{
  constructor(private readonly mapper = new MongoSecurityMapper()) {
    super()
  }

  async findUserById(userId: string) {
    return this.execute(
      'SECURITY_USER_LOOKUP_FAILED',
      'Failed to read security user',
      async () => {
        const user = await User.findOne({
          _id: userId,
          deletedAt: null,
        })
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>()

        return this.mapper.toSecurityUserEntity(user)
      },
    )
  }

  async emailExists(email: string): Promise<boolean> {
    return this.execute(
      'SECURITY_EMAIL_LOOKUP_FAILED',
      'Failed to check security email',
      async () => {
        const user = await User.exists({
          email: this.normalizeEmail(email),
          deletedAt: null,
        })

        return Boolean(user)
      },
    )
  }

  async findUserByPendingEmailTokenHash(tokenHash: string) {
    return this.execute(
      'PENDING_EMAIL_LOOKUP_FAILED',
      'Failed to read user by pending email token',
      async () => {
        const user = await User.findOne({
          pendingEmailChangeTokenHash: tokenHash,
          pendingEmailChangeExpiresAt: {
            $gt: new Date(),
          },
          pendingEmail: {
            $ne: null,
          },
          deletedAt: null,
        })
          .select('+passwordHash +pendingEmailChangeTokenHash')
          .lean<MongoSecurityUserRecord>()

        return this.mapper.toSecurityUserEntity(user)
      },
    )
  }

  async savePendingEmailChange(input: SavePendingEmailChangeInput) {
    return this.execute(
      'PENDING_EMAIL_SAVE_FAILED',
      'Failed to save pending email change',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              pendingEmail: this.normalizeEmail(input.data.pendingEmail),
              pendingEmailChangeTokenHash: input.data.tokenHash,
              pendingEmailChangeExpiresAt: input.data.expiresAt,
              pendingEmailChangeRequestedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>()

        return this.mapper.toSecurityUserEntity(user)
      },
      MongoSecurityErrorMapper.mapDuplicateSecurityRecordError,
    )
  }

  async confirmPendingEmailChange(input: ConfirmPendingEmailChangeInput) {
    return this.execute(
      'PENDING_EMAIL_CONFIRM_FAILED',
      'Failed to confirm pending email change',
      async () => {
        const normalizedEmail = this.normalizeEmail(input.pendingEmail)

        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            pendingEmail: normalizedEmail,
            deletedAt: null,
          },
          {
            $set: {
              email: normalizedEmail,
              emailVerified: true,
            },
            $unset: {
              pendingEmail: '',
              pendingEmailChangeTokenHash: '',
              pendingEmailChangeExpiresAt: '',
              pendingEmailChangeRequestedAt: '',
            },
          },
          {
            returnDocument: 'after',
          },
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>()

        return this.mapper.toSecurityUserEntity(user)
      },
      MongoSecurityErrorMapper.mapDuplicateSecurityRecordError,
    )
  }

  async clearPendingEmailChange(userId: string) {
    return this.execute(
      'PENDING_EMAIL_CLEAR_FAILED',
      'Failed to clear pending email change',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: userId,
            deletedAt: null,
          },
          {
            $unset: {
              pendingEmail: '',
              pendingEmailChangeTokenHash: '',
              pendingEmailChangeExpiresAt: '',
              pendingEmailChangeRequestedAt: '',
            },
          },
          {
            returnDocument: 'after',
          },
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>()

        return this.mapper.toSecurityUserEntity(user)
      },
    )
  }

  async updatePasswordHash(input: UpdateSecurityPasswordHashInput) {
    return this.execute(
      'PASSWORD_UPDATE_FAILED',
      'Failed to update password hash',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              passwordHash: input.passwordHash,
              passwordChangedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>()

        return this.mapper.toSecurityUserEntity(user)
      },
    )
  }

  async scheduleAccountDeletion(input: ScheduleAccountDeletionInput) {
    return this.execute(
      'ACCOUNT_DELETION_SCHEDULE_FAILED',
      'Failed to schedule account deletion',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              status: 'deactivated',
              scheduledDeletionAt: input.scheduledDeletionAt,
              deactivatedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>()

        return this.mapper.toSecurityUserEntity(user)
      },
    )
  }

  async findActiveSessions(userId: string) {
    return this.execute(
      'SESSION_LOOKUP_FAILED',
      'Failed to read active security sessions',
      async () => {
        const sessions = await AuthToken.find({
          userId,
          revokedAt: null,
          expiresAt: {
            $gt: new Date(),
          },
          deletedAt: null,
        })
          .sort({
            updatedAt: -1,
          })
          .lean<MongoSecuritySessionRecord[]>()

        return sessions.map((session) =>
          this.mapper.toSecuritySessionEntity(session),
        )
      },
    )
  }

  async findCurrentSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this.execute(
      'CURRENT_SESSION_LOOKUP_FAILED',
      'Failed to read current refresh token session',
      async () => {
        const session = await AuthToken.findOne({
          refreshTokenHash,
          revokedAt: null,
          expiresAt: {
            $gt: new Date(),
          },
          deletedAt: null,
        }).lean<MongoSecuritySessionRecord>()

        return session ? this.mapper.toSecuritySessionEntity(session) : null
      },
    )
  }

  async revokeSessionById(input: RevokeSecuritySessionInput) {
    return this.execute(
      'SESSION_REVOKE_FAILED',
      'Failed to revoke security session',
      async () => {
        const session = await AuthToken.findOneAndUpdate(
          {
            _id: input.sessionId,
            userId: input.userId,
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
        ).lean<MongoSecuritySessionRecord>()

        return session ? this.mapper.toSecuritySessionEntity(session) : null
      },
    )
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.execute(
      'SESSIONS_REVOKE_FAILED',
      'Failed to revoke all security sessions',
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

  async findTwoFactorByUserId(userId: string) {
    return this.execute(
      'TWO_FACTOR_LOOKUP_FAILED',
      'Failed to read two-factor auth',
      async () => {
        const twoFactor = await TwoFactorAuth.findOne({
          userId,
          deletedAt: null,
        }).lean<MongoTwoFactorRecord>()

        return this.mapper.toTwoFactorEntity(twoFactor)
      },
    )
  }

  async findTwoFactorWithSecret(userId: string) {
    return this.execute(
      'TWO_FACTOR_LOOKUP_FAILED',
      'Failed to read two-factor auth with secret',
      async () => {
        const twoFactor = await TwoFactorAuth.findOne({
          userId,
          deletedAt: null,
        })
          .select('+totpSecretEncrypted')
          .lean<MongoTwoFactorRecord>()

        return this.mapper.toTwoFactorEntity(twoFactor)
      },
    )
  }

  async savePendingTwoFactorSetup(input: SavePendingTwoFactorSetupInput) {
    return this.execute(
      'TWO_FACTOR_SETUP_SAVE_FAILED',
      'Failed to save pending two-factor setup',
      async () => {
        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              userId: input.userId,
              status: 'pending',
              totpSecretEncrypted: input.data.encryptedSecret,
              issuer: input.data.issuer,
              accountLabel: input.data.accountLabel,
              qrCodeUri: input.data.qrCodeUri,
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

        return this.mapper.toTwoFactorEntity(twoFactor)
      },
      MongoSecurityErrorMapper.mapDuplicateSecurityRecordError,
    )
  }

  async activateTwoFactor(input: ActivateTwoFactorInput) {
    return this.execute(
      'TWO_FACTOR_ACTIVATE_FAILED',
      'Failed to activate two-factor auth',
      async () => {
        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId: input.userId,
            status: 'pending',
            deletedAt: null,
          },
          {
            $set: {
              status: 'active',
              enabledAt: new Date(),
              backupCodes: input.backupCodes,
            },
          },
          {
            returnDocument: 'after',
          },
        )
          .select('+totpSecretEncrypted')
          .lean<MongoTwoFactorRecord>()

        return this.mapper.toTwoFactorEntity(twoFactor)
      },
    )
  }

  async disableTwoFactor(userId: string) {
    return this.execute(
      'TWO_FACTOR_DISABLE_FAILED',
      'Failed to disable two-factor auth',
      async () => {
        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId,
            status: 'active',
            deletedAt: null,
          },
          {
            $set: {
              status: 'disabled',
              disabledAt: new Date(),
              backupCodes: [],
            },
            $unset: {
              totpSecretEncrypted: '',
              qrCodeUri: '',
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoTwoFactorRecord>()

        return this.mapper.toTwoFactorEntity(twoFactor)
      },
    )
  }
}

export const mongoSecurityRepository = new MongoSecurityRepository()