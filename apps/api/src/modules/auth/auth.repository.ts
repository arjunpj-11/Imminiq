import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { User, IUser } from '../../infrastructure/database/models/user.model'
import { AuthToken } from '../../infrastructure/database/models/auth-token.model'
import { otpCache, OtpPurpose } from '../../infrastructure/cache/otp.cache'
import { BCRYPT_ROUNDS, OTP_EXPIRES_MINUTES } from '../../config/constants'

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const normalizePhone = (phone: string) => {
  return phone.trim().replace(/\s/g, '')
}

export const authRepository = {
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
      deletedAt: null,
    })),

  phoneExists: async (phone: string) =>
    !!(await User.exists({
      phone: normalizePhone(phone),
      deletedAt: null,
    })),

  usernameExists: async (username: string) =>
    !!(await User.exists({
      username: username.toLowerCase().trim(),
      deletedAt: null,
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

      // Unverified account will be deleted automatically after 30 minutes.
      verificationExpiresAt: new Date(
        Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000
      ),
    }),

  createOAuthUser: (data: {
    fullName: string
    email: string
    username: string
    avatarUrl?: string
    provider: 'google' | 'github'
    providerId: string
  }) =>
    User.create({
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      username: data.username.toLowerCase().trim(),
      avatarUrl: data.avatarUrl,
      provider: data.provider,
      providerId: data.providerId,
      emailVerified: true,
      phoneVerified: false,
      passwordHash: null,

      // OAuth accounts are already verified, so never auto-delete them.
      verificationExpiresAt: null,
    }),

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

  markEmailVerified: (id: string) =>
    User.findByIdAndUpdate(
      id,
      {
        emailVerified: true,

        // Important: stop TTL deletion after verification.
        verificationExpiresAt: null,
      },
      { new: true }
    ),

  markPhoneVerified: (id: string) =>
    User.findByIdAndUpdate(
      id,
      {
        phoneVerified: true,

        // Important: stop TTL deletion after verification.
        verificationExpiresAt: null,
      },
      { new: true }
    ),

  updatePassword: async (id: string, newPassword: string) => {
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

    return User.findByIdAndUpdate(id, { passwordHash }, { new: true })
  },

  updateLastActive: (id: string) =>
    User.findByIdAndUpdate(id, { lastActiveAt: new Date() }),

  // Optional helper if you ever want to manually remove unverified users.
  deleteUserById: (id: string) => User.findByIdAndDelete(id),

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