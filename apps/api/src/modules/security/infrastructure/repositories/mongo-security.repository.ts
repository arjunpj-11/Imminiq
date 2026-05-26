import crypto from 'crypto'

import { User } from '../../../../infrastructure/database/models/user.model'
import { AuthToken } from '../../../../infrastructure/database/models/auth-token.model'
import { TwoFactorAuth } from '../../../../infrastructure/database/models/two-factor-auth.model'
import { authRepository } from '../../../auth'

import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  PendingEmailUserRecord,
  SecurityUserRecord,
  SessionRecord,
  TwoFactorRecord,
} from '../../domain/types/security.types'

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const mongoSecurityRepository: SecurityRepository = {
  findUserById: async (userId: string) => {
    const user = await authRepository.findById(userId)
    return user as SecurityUserRecord | null
  },

  emailExists: async (email: string) => {
    return authRepository.emailExists(email)
  },

  savePendingEmailChange: async (
    userId: string,
    data: {
      pendingEmail: string
      tokenHash: string
      expiresAt: Date
    }
  ) => {
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        deletedAt: null,
      },
      {
        $set: {
          pendingEmail: data.pendingEmail.toLowerCase().trim(),
          pendingEmailChangeTokenHash: data.tokenHash,
          pendingEmailChangeExpiresAt: data.expiresAt,
          pendingEmailChangeRequestedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      }
    ).select('+passwordHash')

    return user as SecurityUserRecord | null
  },

  findUserByPendingEmailTokenHash: async (tokenHash: string) => {
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

    return user as PendingEmailUserRecord | null
  },

  confirmPendingEmailChange: async (
    userId: string,
    pendingEmail: string
  ) => {
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        pendingEmail: pendingEmail.toLowerCase().trim(),
        deletedAt: null,
      },
      {
        $set: {
          email: pendingEmail.toLowerCase().trim(),
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
      }
    ).select('+passwordHash')

    return user as SecurityUserRecord | null
  },

  clearPendingEmailChange: async (userId: string) => {
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
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
      }
    ).select('+passwordHash')

    return user as SecurityUserRecord | null
  },

  findTwoFactorByUserId: async (userId: string) => {
    const twoFactor = await TwoFactorAuth.findOne({
      userId,
      deletedAt: null,
    }).lean()

    return twoFactor as TwoFactorRecord | null
  },

  findTwoFactorWithSecret: async (userId: string) => {
    const twoFactor = await TwoFactorAuth.findOne({
      userId,
      deletedAt: null,
    }).select('+totpSecretEncrypted')

    return twoFactor as TwoFactorRecord | null
  },

  savePendingTwoFactorSetup: async (
    userId: string,
    data: {
      encryptedSecret: string
      issuer: string
      accountLabel: string
      qrCodeUri: string
    }
  ) => {
    const twoFactor = await TwoFactorAuth.findOneAndUpdate(
      {
        userId,
        deletedAt: null,
      },
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
      }
    ).select('+totpSecretEncrypted')

    return twoFactor as TwoFactorRecord | null
  },

  activateTwoFactor: async (
    userId: string,
    backupCodes: Array<{
      codeHash: string
      usedAt: null
    }>
  ) => {
    const twoFactor = await TwoFactorAuth.findOneAndUpdate(
      {
        userId,
        status: 'pending',
        deletedAt: null,
      },
      {
        $set: {
          status: 'active',
          enabledAt: new Date(),
          backupCodes,
        },
      },
      {
        returnDocument: 'after',
      }
    ).select('+totpSecretEncrypted')

    return twoFactor as TwoFactorRecord | null
  },

  disableTwoFactor: async (userId: string) => {
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
      }
    )

    return twoFactor as TwoFactorRecord | null
  },

  findActiveSessions: async (userId: string) => {
    const sessions = await AuthToken.find({
      userId,
      revokedAt: null,
      expiresAt: {
        $gt: new Date(),
      },
      deletedAt: null,
    })
      .sort({ updatedAt: -1 })
      .lean()

    return sessions as SessionRecord[]
  },

  findCurrentRefreshTokenRecord: async (refreshToken: string) => {
    const tokenHash = hashToken(refreshToken)

    const session = await AuthToken.findOne({
      refreshTokenHash: tokenHash,
      revokedAt: null,
      expiresAt: {
        $gt: new Date(),
      },
      deletedAt: null,
    }).lean()

    return session as SessionRecord | null
  },

  revokeSessionById: async (userId: string, sessionId: string) => {
    return AuthToken.findOneAndUpdate(
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
      }
    ).lean()
  },

  revokeAllSessions: async (userId: string) => {
    return AuthToken.updateMany(
      {
        userId,
        revokedAt: null,
        deletedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      }
    )
  },

  scheduleAccountDeletion: async (
    userId: string,
    scheduledDeletionAt: Date
  ) => {
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        deletedAt: null,
      },
      {
        $set: {
          status: 'deactivated',
          scheduledDeletionAt,
          deactivatedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      }
    ).select('+passwordHash')

    return user as SecurityUserRecord | null
  },
}
