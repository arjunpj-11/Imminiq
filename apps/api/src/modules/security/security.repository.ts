// apps/api/src/modules/security/security.repository.ts

import { User } from '../../infrastructure/database/models/user.model'
import { TwoFactorAuth } from '../../infrastructure/database/models/two-factor-auth.model'
import { authRepository } from '../auth/auth.repository'

export const securityRepository = {
  // ─── USER LOOKUPS ─────────────────────────────────

  findUserById: (userId: string) => {
    return authRepository.findById(userId)
  },

  emailExists: (email: string) => {
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
    return User.findOneAndUpdate(
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
  },

  findUserByPendingEmailTokenHash: async (tokenHash: string) => {
    return User.findOne({
      pendingEmailChangeTokenHash: tokenHash,
      pendingEmailChangeExpiresAt: {
        $gt: new Date(),
      },
      pendingEmail: {
        $ne: null,
      },
      deletedAt: null,
    }).select('+pendingEmailChangeTokenHash')
  },

  confirmPendingEmailChange: async (
    userId: string,
    pendingEmail: string
  ) => {
    return User.findOneAndUpdate(
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
  },

  clearPendingEmailChange: async (userId: string) => {
    return User.findOneAndUpdate(
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
  },

  // ─── TWO FACTOR AUTH ──────────────────────────────

  findTwoFactorByUserId: async (userId: string) => {
    return TwoFactorAuth.findOne({
      userId,
      deletedAt: null,
    })
  },

  findTwoFactorWithSecret: async (userId: string) => {
    return TwoFactorAuth.findOne({
      userId,
      deletedAt: null,
    }).select('+totpSecretEncrypted +qrCodeUri')
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
    return TwoFactorAuth.findOneAndUpdate(
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
  },

  activateTwoFactor: async (
    userId: string,
    backupCodes: Array<{
      codeHash: string
      usedAt: null
    }>
  ) => {
    return TwoFactorAuth.findOneAndUpdate(
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
  },

  disableTwoFactor: async (userId: string) => {
    return TwoFactorAuth.findOneAndUpdate(
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
  },

  // ─── SESSIONS ─────────────────────────────────────

  findActiveSessions: (userId: string) => {
    return authRepository.findAllUserTokens(userId)
  },

  findCurrentRefreshTokenRecord: async (refreshToken: string) => {
    return authRepository.findRefreshToken(refreshToken)
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

  // ─── ACCOUNT DELETE ───────────────────────────────

  softDeleteAccount: async (userId: string) => {
    return User.findOneAndUpdate(
      {
        _id: userId,
        deletedAt: null,
      },
      {
        $set: {
          status: 'deactivated',
          deletedAt: new Date(),
        },
      },
      {
        returnDocument: 'after',
      }
    )
  },
}