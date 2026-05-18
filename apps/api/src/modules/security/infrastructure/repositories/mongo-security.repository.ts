import { User } from '../../../../infrastructure/database/models/user.model'
import { TwoFactorAuth } from '../../../../infrastructure/database/models/two-factor-auth.model'
import { authRepository } from '../../../auth/auth.repository'

import type { SecurityRepository } from '../../domain/repositories/security.repository.interface'
import type {
  PendingEmailUserRecord,
  SecurityUserRecord,
  SessionRecord,
  TwoFactorRecord,
} from '../../domain/types/security.types'

export const mongoSecurityRepository: SecurityRepository = {
  // ─── USER LOOKUPS ─────────────────────────────────

  findUserById: async (userId: string) => {
    const user = await authRepository.findById(userId)
    return user as SecurityUserRecord | null
  },

  emailExists: async (email: string) => {
    return authRepository.emailExists(email)
  },

  // ─── EMAIL CHANGE REQUEST ─────────────────────────

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
    )

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
    }).select('+pendingEmailChangeTokenHash')

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
    )

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
    )

    return user as SecurityUserRecord | null
  },

  // ─── TWO FACTOR AUTH ──────────────────────────────

  findTwoFactorByUserId: async (userId: string) => {
    const twoFactor = await TwoFactorAuth.findOne({
      userId,
      deletedAt: null,
    })

    return twoFactor as TwoFactorRecord | null
  },

  findTwoFactorWithSecret: async (userId: string) => {
    const twoFactor = await TwoFactorAuth.findOne({
      userId,
      deletedAt: null,
    }).select('+totpSecretEncrypted +qrCodeUri')

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
      },
      {
        $set: {
          status: 'pending',
          totpSecretEncrypted: data.encryptedSecret,
          totpIssuer: data.issuer,
          totpAccountLabel: data.accountLabel,
          qrCodeUri: data.qrCodeUri,

          backupCodes: [],
          backupCodesUsed: 0,
          backupCodesRegeneratedAt: null,

          enabledAt: null,
          disabledAt: null,
          lastUsedAt: null,
          deletedAt: null,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    )

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
          backupCodes,
          backupCodesUsed: 0,
          backupCodesRegeneratedAt: new Date(),
          enabledAt: new Date(),
          disabledAt: null,
          qrCodeUri: null,
        },
      },
      {
        returnDocument: 'after',
      }
    )

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
          backupCodesUsed: 0,
        },
      },
      {
        returnDocument: 'after',
      }
    )

    return twoFactor as TwoFactorRecord | null
  },

  // ─── SESSIONS ─────────────────────────────────────

  findActiveSessions: async (userId: string) => {
    const sessions = await authRepository.findAllUserTokens(userId)
    return sessions as SessionRecord[]
  },

  findCurrentRefreshTokenRecord: async (refreshToken: string) => {
    const record = await authRepository.findRefreshToken(refreshToken)
    return record as SessionRecord | null
  },

  revokeSessionById: async (
    userId: string,
    sessionId: string
  ) => {
    return authRepository.revokeSessionById(sessionId, userId)
  },

  revokeAllSessions: async (userId: string) => {
    return authRepository.revokeAllUserTokens(userId)
  },

  // ─── ACCOUNT DELETION SCHEDULING ──────────────────

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
          deletionRequestedAt: new Date(),
          scheduledDeletionAt,
        },
      },
      {
        returnDocument: 'after',
      }
    )

    return user as SecurityUserRecord | null
  },
}