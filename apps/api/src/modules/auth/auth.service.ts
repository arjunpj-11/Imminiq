import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { authRepository } from './auth.repository'
import { ApiError } from '../../shared/utils/ApiError'
import { env } from '../../config/env'
import { BCRYPT_ROUNDS, OTP_EXPIRES_MINUTES } from '../../config/constants'
import { sendMail } from '../../infrastructure/email/email.client'
import {
  RegisterPayload,
  LoginPayload,
  TokenPair,
  AuthUser,
  JwtPayload,
  AuthRole,
} from './auth.types'

type OtpPurpose = 'email_verification' | 'phone_verification' | 'password_reset'

type RequestMeta = {
  device?: string
  ipAddress?: string
  userAgent?: string
}

const isEmailIdentifier = (identifier: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(identifier.trim())
}

const normalizeIdentifier = (identifier: string) => {
  const value = identifier.trim()

  if (isEmailIdentifier(value)) {
    return {
      email: value.toLowerCase(),
      phone: undefined,
      method: 'email' as const,
      value: value.toLowerCase(),
    }
  }

  return {
    email: undefined,
    phone: value.replace(/\s/g, ''),
    method: 'phone' as const,
    value: value.replace(/\s/g, ''),
  }
}

export const authService = {
  // ─── REGISTER ────────────────────────────────────

  register: async (payload: RegisterPayload): Promise<{
    user: AuthUser
    verificationTarget: string
    verificationMethod: 'email' | 'phone'
  }> => {
    const { fullName, identifier, password } = payload

    const parsedIdentifier = normalizeIdentifier(identifier)

    if (parsedIdentifier.email) {
      const exists = await authRepository.emailExists(parsedIdentifier.email)

      if (exists) {
        throw new ApiError(409, 'Email already in use', 'EMAIL_TAKEN')
      }
    }

    if (parsedIdentifier.phone) {
      const exists = await authRepository.phoneExists(parsedIdentifier.phone)

      if (exists) {
        throw new ApiError(409, 'Phone already in use', 'PHONE_TAKEN')
      }
    }

    const username =
      payload.username || (await authService.generateUsername(fullName))

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    const user = await authRepository.createUser({
      fullName,
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      username,
      passwordHash,
    })

    const otp = authService.generateOtp()

    const purpose: OtpPurpose =
      parsedIdentifier.method === 'email'
        ? 'email_verification'
        : 'phone_verification'

    await authRepository.saveOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      otp,
      purpose,
    })

    if (parsedIdentifier.email) {
      await sendMail(
        parsedIdentifier.email,
        'Verify your Imminiq account',
        `<p>Your verification code is: <strong>${otp}</strong>. Expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`
      )
    }

    // TODO: send SMS when phone verification provider is added.

    return {
      user: authService.formatUser(user),
      verificationTarget: parsedIdentifier.value,
      verificationMethod: parsedIdentifier.method,
    }
  },

  // ─── LOGIN ───────────────────────────────────────

  login: async (
    payload: LoginPayload,
    meta?: RequestMeta
  ): Promise<{ tokens: TokenPair; user: AuthUser }> => {
    const user = await authRepository.findByIdentifier(payload.identifier)

    if (!user) {
      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
    }

    if (user.status === 'blocked' || user.status === 'banned') {
      throw new ApiError(403, 'Account blocked', 'ACCOUNT_BLOCKED')
    }

    if (user.status === 'deactivated') {
      throw new ApiError(403, 'Account deactivated', 'ACCOUNT_DEACTIVATED')
    }

    if (!user.passwordHash) {
      throw new ApiError(
        400,
        'This account uses social login. Please sign in with Google or GitHub.',
        'OAUTH_ACCOUNT'
      )
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash)

    if (!valid) {
      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
    }

    const tokens = await authService.generateTokenPair(
      user._id.toString(),
      user.role,
      meta
    )

    await authRepository.updateLastActive(user._id.toString())

    return {
      tokens,
      user: authService.formatUser(user),
    }
  },

  // ─── OAUTH LOGIN ─────────────────────────────────

  handleOAuthLogin: async (
    user: any,
    meta?: RequestMeta
  ): Promise<{ tokens: TokenPair; user: AuthUser }> => {
    await authRepository.updateLastActive(user._id.toString())

    const tokens = await authService.generateTokenPair(
      user._id.toString(),
      user.role,
      meta
    )

    return {
      tokens,
      user: authService.formatUser(user),
    }
  },

  // ─── LOGOUT ─────────────────────────────────────

  logout: async (refreshToken: string) => {
    await authRepository.revokeRefreshToken(refreshToken)
  },

  logoutAll: async (userId: string) => {
    await authRepository.revokeAllUserTokens(userId)
  },

  // ─── REFRESH TOKEN ───────────────────────────────

  refreshTokens: async (
    refreshToken: string,
    meta?: RequestMeta
  ): Promise<TokenPair> => {
    const tokenRecord = await authRepository.findRefreshToken(refreshToken)

    if (!tokenRecord) {
      throw new ApiError(401, 'Invalid refresh token', 'UNAUTHORIZED')
    }

    const user = await authRepository.findById(tokenRecord.userId.toString())

    if (!user) {
      throw new ApiError(401, 'User not found', 'UNAUTHORIZED')
    }

    if (user.status === 'blocked' || user.status === 'banned') {
      throw new ApiError(403, 'Account blocked', 'ACCOUNT_BLOCKED')
    }

    if (user.status === 'deactivated') {
      throw new ApiError(403, 'Account deactivated', 'ACCOUNT_DEACTIVATED')
    }

    await authRepository.revokeRefreshToken(refreshToken)

    return authService.generateTokenPair(
      user._id.toString(),
      user.role,
      meta
    )
  },

  // ─── GET ME ──────────────────────────────────────

  getMe: async (userId: string): Promise<AuthUser> => {
    const user = await authRepository.findById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    return authService.formatUser(user)
  },

  // ─── VERIFY ACCOUNT ──────────────────────────────

  verifyAccount: async (identifier: string, otp: string) => {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const purpose: OtpPurpose =
      parsedIdentifier.method === 'email'
        ? 'email_verification'
        : 'phone_verification'

    const valid = await authRepository.verifyOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      otp,
      purpose,
    })

    if (!valid) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
    }

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    if (parsedIdentifier.method === 'email') {
      await authRepository.markEmailVerified(user._id.toString())
    } else {
      await authRepository.markPhoneVerified(user._id.toString())
    }
  },

  // ─── RESEND OTP ──────────────────────────────────

  resendOtp: async (
    identifier: string,
    purpose: OtpPurpose
  ) => {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    const otp = authService.generateOtp()

    await authRepository.saveOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      otp,
      purpose,
    })

    if (parsedIdentifier.email) {
      const subjects: Record<OtpPurpose, string> = {
        email_verification: 'Verify your Imminiq account',
        phone_verification: 'Verify your Imminiq account',
        password_reset: 'Reset your Imminiq password',
      }

      const bodies: Record<OtpPurpose, string> = {
        email_verification: `<p>Your verification code is: <strong>${otp}</strong>. Expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`,
        phone_verification: `<p>Your verification code is: <strong>${otp}</strong>. Expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`,
        password_reset: `<p>Your password reset code is: <strong>${otp}</strong>. Expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`,
      }

      await sendMail(parsedIdentifier.email, subjects[purpose], bodies[purpose])
    }

    // TODO: send SMS when phone verification provider is added.
  },

  // ─── FORGOT PASSWORD ─────────────────────────────

  forgotPassword: async (identifier: string) => {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) return

    const otp = authService.generateOtp()

    await authRepository.saveOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      otp,
      purpose: 'password_reset',
    })

    if (parsedIdentifier.email) {
      await sendMail(
        parsedIdentifier.email,
        'Reset your Imminiq password',
        `<p>Your password reset code is: <strong>${otp}</strong>. Expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`
      )
    }

    // TODO: send SMS when phone password reset provider is added.
  },

  // ─── VERIFY RESET CODE ───────────────────────────

  verifyResetCode: async (identifier: string, otp: string) => {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const valid = await authRepository.verifyOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      otp,
      purpose: 'password_reset',
    })

    if (!valid) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
    }
  },

  // ─── RESET PASSWORD ──────────────────────────────

  resetPassword: async (
    identifier: string,
    otp: string,
    newPassword: string
  ) => {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const valid = await authRepository.verifyOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      otp,
      purpose: 'password_reset',
    })

    if (!valid) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
    }

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    await authRepository.updatePassword(user._id.toString(), newPassword)
    await authRepository.revokeAllUserTokens(user._id.toString())
  },

  // ─── CHANGE PASSWORD ─────────────────────────────

  changePassword: async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const user = await authRepository.findById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    if (!user.passwordHash) {
      throw new ApiError(
        400,
        'OAuth accounts cannot change password',
        'OAUTH_ACCOUNT'
      )
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!valid) {
      throw new ApiError(400, 'Current password is incorrect', 'WRONG_PASSWORD')
    }

    await authRepository.updatePassword(userId, newPassword)
    await authRepository.revokeAllUserTokens(userId)
  },

  // ─── CHECK IDENTIFIER / USERNAME ─────────────────

  checkIdentifier: async (identifier: string) => {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const exists =
      parsedIdentifier.method === 'email'
        ? await authRepository.emailExists(parsedIdentifier.value)
        : await authRepository.phoneExists(parsedIdentifier.value)

    return {
      available: !exists,
      type: parsedIdentifier.method,
    }
  },

  checkUsername: async (username: string) => {
    const exists = await authRepository.usernameExists(username)

    return { available: !exists }
  },

  // ─── SESSIONS ────────────────────────────────────

  getSessions: async (userId: string) => {
    return authRepository.findAllUserTokens(userId)
  },

  revokeSession: async (userId: string, sessionId: string) => {
    await authRepository.revokeSessionById(sessionId, userId)
  },

  // ─── HELPERS ─────────────────────────────────────

  generateTokenPair: async (
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair> => {
    const accessToken = jwt.sign(
      {
        userId,
        role,
        type: 'access',
      } as JwtPayload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    )

    const refreshToken = crypto.randomBytes(64).toString('hex')

    await authRepository.saveRefreshToken({
      userId,
      refreshToken,
      device: meta?.device,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    })

    return {
      accessToken,
      refreshToken,
    }
  },

  generateOtp: (): string => {
    return crypto.randomInt(100000, 1000000).toString()
  },

  generateUsername: async (fullName: string): Promise<string> => {
    const base =
      fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20) || 'user'

    let username = base
    let counter = 1

    while (await authRepository.usernameExists(username)) {
      username = `${base}${counter}`
      counter++
    }

    return username
  },

  formatUser: (user: any): AuthUser => ({
    _id: user._id.toString(),
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    isPremium: user.isPremium,
    avatarUrl: user.avatarUrl,
    onboardingCompleted: user.onboardingCompleted,
  }),
}