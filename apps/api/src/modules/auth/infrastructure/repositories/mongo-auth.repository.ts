import crypto from 'crypto'
import bcrypt from 'bcryptjs'

import { User, IUser } from '../../../../infrastructure/database/models/user.model'
import { AuthToken } from '../../../../infrastructure/database/models/auth-token.model'
import { TwoFactorAuth } from '../../../../infrastructure/database/models/two-factor-auth.model'
import { UserProfile } from '../../../../infrastructure/database/models/user-profile.model'

import { otpCache, OtpPurpose } from '../../../../infrastructure/cache/otp.cache'
import { BCRYPT_ROUNDS, OTP_EXPIRES_MINUTES } from '../../../../config/constants'

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const normalizePhone = (phone: string) => {
  return phone.trim().replace(/\s/g, '')
}

export const mongoAuthRepository = {
  // ─── USER QUERIES ───────────────────────────────

  findByEmail: (email: string) =>
    User.findOne({
      email: email.toLowerCase().trim(),
      deletedAt: null,
    }).select('+passwordHash'),

  findByPhone: (phone: string) =>
    User.findOne({
      phone: normalizePhone(phone),
      deletedAt: null,
    }).select('+passwordHash'),

  findByIdentifier: (identifier: string) => {
    const value = identifier.trim()
    const isEmail = value.includes('@')

    return User.findOne({
      ...(isEmail
        ? { email: value.toLowerCase() }
        : { phone: normalizePhone(value) }),
      deletedAt: null,
    }).select('+passwordHash')
  },

  findById: (id: string) =>
    User.findOne({
      _id: id,
      deletedAt: null,
    }).select('+passwordHash'),

  findByUsername: (username: string) =>
    User.findOne({
      username: username.toLowerCase().trim(),
      deletedAt: null,
    }),

emailExists: async (email: string) =>
  !!(await User.exists({
    email: email.toLowerCase().trim(),
  })),

phoneExists: async (phone: string) =>
  !!(await User.exists({
    phone: normalizePhone(phone),
  })),

usernameExists: async (username: string) =>
  !!(await User.exists({
    username: username.toLowerCase().trim(),
  })),

  createUser: async (data: {
    fullName: string
    email?: string
    phone?: string
    username: string
    passwordHash: string
  }) =>
    User.create({
      fullName: data.fullName.trim(),
      email: data.email?.toLowerCase().trim(),
      phone: data.phone ? normalizePhone(data.phone) : undefined,
      username: data.username.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      provider: 'local',
      emailVerified: false,
      phoneVerified: false,

      verificationExpiresAt: new Date(
        Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000
      ),
    }),

    createOAuthUser: async (data: {
    fullName: string
    email: string
    username: string
    avatarUrl?: string
    provider: 'google' | 'github'
    providerId: string
  }) => {
    const normalizedEmail = data.email.toLowerCase().trim()

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).select('+passwordHash')

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
      ).select('+passwordHash')

      if (updatedUser) {
        await UserProfile.findOneAndUpdate(
          { userId: updatedUser._id },
          {
            $setOnInsert: {
              userId: updatedUser._id,
              fullName: updatedUser.fullName,
              publicProfileEnabled: true,
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true,
          }
        )

        return updatedUser
      }
    }

    const user = await User.create({
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      username: data.username.toLowerCase().trim(),
      avatarUrl: data.avatarUrl,
      provider: data.provider,
      providerId: data.providerId,
      emailVerified: true,
      phoneVerified: false,
      passwordHash: null,
      verificationExpiresAt: null,
    })

    await UserProfile.findOneAndUpdate(
      { userId: user._id },
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

    return user
  },

  updateProfile: (
    id: string,
    data: {
      fullName?: string
      username?: string
      avatarUrl?: string
    }
  ) =>
    User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      {
        ...(data.fullName ? { fullName: data.fullName.trim() } : {}),
        ...(data.username
          ? { username: data.username.toLowerCase().trim() }
          : {}),
        ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      },
      { new: true }
    ),

  updateUser: (id: string, data: Partial<IUser>) =>
    User.findByIdAndUpdate(id, data, { new: true }),

  markEmailVerified: async (id: string) => {
    const user = await User.findByIdAndUpdate(
      id,
      {
        emailVerified: true,
        verificationExpiresAt: null,
      },
      { returnDocument: 'after' }
    )

    if (user) {
      await UserProfile.findOneAndUpdate(
        { userId: user._id },
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

    return user
  },

  markPhoneVerified: async (id: string) => {
    const user = await User.findByIdAndUpdate(
      id,
      {
        phoneVerified: true,
        verificationExpiresAt: null,
      },
      { returnDocument: 'after' }
    )

    if (user) {
      await UserProfile.findOneAndUpdate(
        { userId: user._id },
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

    return user
  },

  updatePassword: async (id: string, newPassword: string) => {
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

    return User.findByIdAndUpdate(id, { passwordHash }, { new: true })
  },

  updateLastActive: (id: string) =>
    User.findByIdAndUpdate(id, { lastActiveAt: new Date() }),

    cancelScheduledDeletionIfRecoverable: async (id: string) => {
    return User.findOneAndUpdate(
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
    )
  },

  deleteUserById: (id: string) => User.findByIdAndDelete(id),

  // ─── TWO-FACTOR LOGIN QUERIES ───────────────────

  hasActiveTwoFactor: async (userId: string) => {
    return !!(await TwoFactorAuth.exists({
      userId,
      status: 'active',
      deletedAt: null,
    }))
  },

  findActiveTwoFactorForLogin: async (userId: string) => {
    return TwoFactorAuth.findOne({
      userId,
      status: 'active',
      deletedAt: null,
    }).select(
      '+totpSecretEncrypted +backupCodes +backupCodes.codeHash'
    )
  },

  touchTwoFactorLastUsed: async (userId: string) => {
    return TwoFactorAuth.findOneAndUpdate(
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
    )
  },

  markBackupCodeUsed: async (
    userId: string,
    backupCodeIndex: number
  ) => {
    const usedAtPath = `backupCodes.${backupCodeIndex}.usedAt`

    return TwoFactorAuth.findOneAndUpdate(
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
    )
  },

  // ─── TOKEN QUERIES ───────────────────────────────

  saveRefreshToken: async (data: {
    userId: string
    refreshToken: string
    device?: string
    ipAddress?: string
    userAgent?: string
  }) => {
    const refreshTokenHash = hashToken(data.refreshToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    return AuthToken.create({
      userId: data.userId,
      refreshTokenHash,
      device: data.device,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      expiresAt,
    })
  },

  findRefreshToken: async (refreshToken: string) => {
    const refreshTokenHash = hashToken(refreshToken)

    return AuthToken.findOne({
      refreshTokenHash,
      expiresAt: { $gt: new Date() },
      revokedAt: null,
      deletedAt: null,
    })
  },

  rotateRefreshTokenInSameSession: async (
    sessionId: string,
    newRefreshToken: string,
    meta?: {
      device?: string
      ipAddress?: string
      userAgent?: string
    }
  ) => {
    const refreshTokenHash = hashToken(newRefreshToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    return AuthToken.findOneAndUpdate(
      {
        _id: sessionId,
        revokedAt: null,
        deletedAt: null,
      },
      {
        $set: {
          refreshTokenHash,
          expiresAt,
          ...(meta?.device ? { device: meta.device } : {}),
          ...(meta?.ipAddress ? { ipAddress: meta.ipAddress } : {}),
          ...(meta?.userAgent ? { userAgent: meta.userAgent } : {}),
        },
      },
      {
        returnDocument: 'after',
      }
    )
  },

  findAllUserTokens: (userId: string) =>
    AuthToken.find({
      userId,
      expiresAt: { $gt: new Date() },
      revokedAt: null,
      deletedAt: null,
    }).sort({ createdAt: -1 }),

  revokeRefreshToken: async (refreshToken: string) => {
    const refreshTokenHash = hashToken(refreshToken)

    const result = await AuthToken.findOneAndUpdate(
      {
        refreshTokenHash,
        revokedAt: null,
        deletedAt: null,
      },
      { revokedAt: new Date() },
      { new: true }
    )

    return !!result
  },

  revokeAllUserTokens: (userId: string) =>
    AuthToken.updateMany(
      {
        userId,
        revokedAt: null,
        deletedAt: null,
      },
      { revokedAt: new Date() }
    ),

  revokeSessionById: (sessionId: string, userId: string) =>
    AuthToken.findOneAndUpdate(
      {
        _id: sessionId,
        userId,
        revokedAt: null,
        deletedAt: null,
      },
      { revokedAt: new Date() },
      { new: true }
    ),

  // ─── OTP QUERIES USING REDIS ─────────────────────

  saveOtp: async (data: {
    email?: string
    phone?: string
    otp: string
    purpose: OtpPurpose
  }) => {
    const identifier = data.email || data.phone

    if (!identifier) {
      throw new Error('Email or phone is required to save OTP')
    }

    const normalizedIdentifier = data.email
      ? data.email.toLowerCase().trim()
      : normalizePhone(data.phone!)

    const otpHash = await bcrypt.hash(data.otp, BCRYPT_ROUNDS)

    await otpCache.save(normalizedIdentifier, data.purpose, otpHash)

    return true
  },

  verifyOtp: async (data: {
    email?: string
    phone?: string
    otp: string
    purpose: OtpPurpose
  }) => {
    const identifier = data.email || data.phone

    if (!identifier) {
      return false
    }

    const normalizedIdentifier = data.email
      ? data.email.toLowerCase().trim()
      : normalizePhone(data.phone!)

    const otpHash = await otpCache.get(normalizedIdentifier, data.purpose)

    if (!otpHash) {
      return false
    }

    const match = await bcrypt.compare(data.otp, otpHash)

    if (match) {
      await otpCache.delete(normalizedIdentifier, data.purpose)
    }

    return match
  },
}
