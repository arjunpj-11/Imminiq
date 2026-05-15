import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'
import { authRepository } from './auth.repository'
import { ApiError } from '../../shared/utils/ApiError'
import { env } from '../../config/env'
import { BCRYPT_ROUNDS } from '../../config/constants'
import { sendMail } from '../../infrastructure/email/email.client'
import { otpEmailTemplate } from '../../shared/email/email.templates'
import { trackerRepository } from '../trackers/tracker.repository'
import {
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../../infrastructure/sms/message-central.client'

import { phoneOtpSessionCache } from '../../infrastructure/cache/phone-otp-session.cache'

import {
  RegisterPayload,
  LoginPayload,
  TokenPair,
  AuthUser,
  JwtPayload,
  AuthRole,
} from './auth.types'

type ResetTokenPayload = {
  userId: string
  purpose: 'password_reset'
}

export type OAuthLoginUser = OAuthFormattedUserSource & {
  role: 'user' | 'admin' | 'moderator' | 'superadmin'
}

type OAuthFormattedUserSource = Pick<
  AuthUser,
  | 'fullName'
  | 'username'
  | 'email'
  | 'phone'
  | 'role'
  | 'status'
  | 'emailVerified'
  | 'phoneVerified'
  | 'isPremium'
  | 'avatarUrl'
  | 'onboardingCompleted'
> & {
  _id: {
    toString(): string
  }
}

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

  const normalizedPhone = value.replace(/\s/g, '')

  return {
    email: undefined,
    phone: normalizedPhone,
    method: 'phone' as const,
    value: normalizedPhone,
  }
}

const getVerificationPurpose = (
  method: 'email' | 'phone'
): OtpPurpose => {
  return method === 'email' ? 'email_verification' : 'phone_verification'
}

const sendVerificationOtp = async (data: {
  email?: string
  phone?: string
  method: 'email' | 'phone'
}) => {
  const purpose = getVerificationPurpose(data.method)

  if (data.email) {
    const otp = authService.generateOtp()

    await authRepository.saveOtp({
      email: data.email,
      otp,
      purpose,
    })

    await sendMail(
      data.email,
      'Verify your Imminiq account',
      otpEmailTemplate({
        otp,
        type: 'verify_account',
      })
    )

    return
  }

  if (data.phone) {
    const { verificationId } = await sendPhoneOtp(data.phone)

    await phoneOtpSessionCache.saveVerificationId(
      data.phone,
      'phone_verification',
      verificationId
    )
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

    // If same email exists but is unverified:
    // Do not show "Email already in use".
    // Resend OTP and return verification response.
    if (parsedIdentifier.email) {
      const existingUser = await authRepository.findByEmail(parsedIdentifier.email)

      if (existingUser) {
        if (!existingUser.emailVerified) {
          await sendVerificationOtp({
            email: parsedIdentifier.email,
            method: 'email',
          })

          return {
            user: authService.formatter(existingUser),
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          }
        }

        throw new ApiError(409, 'Email already in use', 'EMAIL_TAKEN')
      }
    }

    // If same phone exists but is unverified:
    // Do not show "Phone already in use".
    // Resend OTP and return verification response.
    if (parsedIdentifier.phone) {
      const existingUser = await authRepository.findByPhone(parsedIdentifier.phone)

      if (existingUser) {
        if (!existingUser.phoneVerified) {
          await sendVerificationOtp({
            phone: parsedIdentifier.phone,
            method: 'phone',
          })

          return {
            user: authService.formatter(existingUser),
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          }
        }

        throw new ApiError(409, 'Phone already in use', 'PHONE_TAKEN')
      }
    }

    const username = await authService.generateRegistrationUsername({
      email: parsedIdentifier.email,
      fullName,
    })

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    const user = await authRepository.createUser({
      fullName,
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      username,
      passwordHash,
    })

    await sendVerificationOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      method: parsedIdentifier.method,
    })

    return {
      user: authService.formatter(user),
      verificationTarget: parsedIdentifier.value,
      verificationMethod: parsedIdentifier.method,
    }
  },

  // ─── LOGIN ───────────────────────────────────────

 login: async (
  payload: LoginPayload,
  meta?: RequestMeta
): Promise<{
  tokens: TokenPair
  user: AuthUser
  redirectPath: '/dashboard' | '/onboarding/step-1'
}> => {
  const parsedIdentifier = normalizeIdentifier(payload.identifier)

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

  if (user.status === 'paused') {
    throw new ApiError(403, 'Account paused', 'ACCOUNT_PAUSED')
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

  if (parsedIdentifier.method === 'email' && !user.emailVerified) {
    await sendVerificationOtp({
      email: parsedIdentifier.email,
      method: 'email',
    })

    throw new ApiError(
      403,
      'Please verify your email before signing in. A new OTP has been sent.',
      'EMAIL_NOT_VERIFIED'
    )
  }

  if (parsedIdentifier.method === 'phone' && !user.phoneVerified) {
    await sendVerificationOtp({
      phone: parsedIdentifier.phone,
      method: 'phone',
    })

    throw new ApiError(
      403,
      'Please verify your phone before signing in. A new OTP has been sent.',
      'PHONE_NOT_VERIFIED'
    )
  }

  const tokens = await authService.generateTokenPair(
    user._id.toString(),
    user.role,
    meta
  )

  const hasTracker = await trackerRepository.hasAnyTrackerForUser(
    user._id.toString()
  )

  const redirectPath = hasTracker
    ? '/dashboard'
    : '/onboarding/step-1'

  await authRepository.updateLastActive(user._id.toString())

  return {
    tokens,
    user: authService.formatter(user),
    redirectPath,
  }
},

  // ─── OAUTH LOGIN ─────────────────────────────────

handleOAuthLogin: async (
  user: OAuthLoginUser,
  meta?: RequestMeta
): Promise<{
  tokens: TokenPair
  user: AuthUser
  redirectPath: '/dashboard' | '/onboarding/step-1'
}> => {
  await authRepository.updateLastActive(user._id.toString())

  const tokens = await authService.generateTokenPair(
    user._id.toString(),
    user.role,
    meta
  )

  const hasTracker = await trackerRepository.hasAnyTrackerForUser(
    user._id.toString()
  )

  const redirectPath = hasTracker
    ? '/dashboard'
    : '/onboarding/step-1'

  return {
    tokens,
    user: authService.formatter(user),
    redirectPath,
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

    if (user.status === 'paused') {
      throw new ApiError(403, 'Account paused', 'ACCOUNT_PAUSED')
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

    return authService.formatter(user)
  },

  // ─── VERIFY ACCOUNT ──────────────────────────────

 verifyAccount: async (identifier: string, otp: string) => {
  const parsedIdentifier = normalizeIdentifier(identifier)

  const user = await authRepository.findByIdentifier(parsedIdentifier.value)

  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND')
  }

  // ─── EMAIL OTP VERIFICATION ─────────────────────
  if (parsedIdentifier.method === 'email') {
    const valid = await authRepository.verifyOtp({
      email: parsedIdentifier.email,
      otp,
      purpose: 'email_verification',
    })

    if (!valid) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
    }

    if (user.emailVerified) {
      throw new ApiError(
        400,
        'Email is already verified',
        'EMAIL_ALREADY_VERIFIED'
      )
    }

    await authRepository.markEmailVerified(user._id.toString())
    return
  }

  // ─── PHONE OTP VERIFICATION ─────────────────────
  if (parsedIdentifier.method === 'phone') {
    const verificationId =
      await phoneOtpSessionCache.getVerificationId(
        parsedIdentifier.phone!,
        'phone_verification'
      )

    if (!verificationId) {
      throw new ApiError(
        400,
        'OTP session expired. Please request a new OTP.',
        'OTP_SESSION_EXPIRED'
      )
    }

    const valid = await verifyPhoneOtp(verificationId, otp)

    if (!valid) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
    }

    if (user.phoneVerified) {
      throw new ApiError(
        400,
        'Phone is already verified',
        'PHONE_ALREADY_VERIFIED'
      )
    }

    await authRepository.markPhoneVerified(user._id.toString())

    await phoneOtpSessionCache.deleteVerificationId(
      parsedIdentifier.phone!,
      'phone_verification'
    )
  }
},

  // ─── RESEND OTP ──────────────────────────────────

  resendOtp: async (identifier: string, purpose: OtpPurpose) => {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    if (
      purpose === 'email_verification' &&
      parsedIdentifier.method === 'email' &&
      user.emailVerified
    ) {
      throw new ApiError(
        400,
        'Email is already verified',
        'EMAIL_ALREADY_VERIFIED'
      )
    }

    if (
      purpose === 'phone_verification' &&
      parsedIdentifier.method === 'phone' &&
      user.phoneVerified
    ) {
      throw new ApiError(
        400,
        'Phone is already verified',
        'PHONE_ALREADY_VERIFIED'
      )
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


      await sendMail(parsedIdentifier.email, subjects[purpose], otpEmailTemplate({
        otp,
        type: purpose === 'password_reset' ? 'reset_password' : 'verify_account'
      }))
    }

    // TODO: send SMS when phone verification provider is added.
  },

  // ─── FORGOT PASSWORD ─────────────────────────────

  forgotPassword: async (identifier: string) => {
  const parsedIdentifier = normalizeIdentifier(identifier)

  const user = await authRepository.findByIdentifier(parsedIdentifier.value)

  if (!user) return

  // ─── EMAIL PASSWORD RESET OTP ───────────────────
  if (parsedIdentifier.email) {
    const otp = authService.generateOtp()

    await authRepository.saveOtp({
      email: parsedIdentifier.email,
      otp,
      purpose: 'password_reset',
    })

    await sendMail(
      parsedIdentifier.email,
      'Reset your Imminiq password',
      otpEmailTemplate({
        otp,
        type: 'reset_password',
      })
    )

    return
  }

  // ─── PHONE PASSWORD RESET OTP ───────────────────
  if (parsedIdentifier.phone) {
    const { verificationId } = await sendPhoneOtp(parsedIdentifier.phone)

    await phoneOtpSessionCache.saveVerificationId(
      parsedIdentifier.phone,
      'password_reset',
      verificationId
    )
  }
},

  // ─── VERIFY RESET CODE ───────────────────────────

verifyResetCode: async (identifier: string, otp: string) => {
  const parsedIdentifier = normalizeIdentifier(identifier)

  const user = await authRepository.findByIdentifier(parsedIdentifier.value)

  if (!user) {
    throw new ApiError(404, 'User not found', 'NOT_FOUND')
  }

  // ─── EMAIL RESET OTP VERIFICATION ───────────────
  if (parsedIdentifier.email) {
    const valid = await authRepository.verifyOtp({
      email: parsedIdentifier.email,
      otp,
      purpose: 'password_reset',
    })

    if (!valid) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
    }
  }

  // ─── PHONE RESET OTP VERIFICATION ───────────────
  if (parsedIdentifier.phone) {
    const verificationId =
      await phoneOtpSessionCache.getVerificationId(
        parsedIdentifier.phone,
        'password_reset'
      )

    if (!verificationId) {
      throw new ApiError(
        400,
        'OTP session expired. Please request a new OTP.',
        'OTP_SESSION_EXPIRED'
      )
    }

    const valid = await verifyPhoneOtp(verificationId, otp)

    if (!valid) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
    }

    await phoneOtpSessionCache.deleteVerificationId(
      parsedIdentifier.phone,
      'password_reset'
    )
  }

  const resetTokenOptions: SignOptions = {
    expiresIn: '10m',
  }

  const resetToken = jwt.sign(
    {
      userId: user._id.toString(),
      purpose: 'password_reset',
    },
    env.JWT_SECRET,
    resetTokenOptions
  )

  return {
    resetToken,
  }
},
  // ─── RESET PASSWORD ──────────────────────────────

 resetPassword: async (resetToken: string, newPassword: string) => {
  let decoded: ResetTokenPayload

  try {
    decoded = jwt.verify(resetToken, env.JWT_SECRET) as ResetTokenPayload
  } catch {
    throw new ApiError(
      400,
      'Invalid or expired reset token',
      'INVALID_RESET_TOKEN'
    )
  }

  if (decoded.purpose !== 'password_reset') {
    throw new ApiError(
      400,
      'Invalid reset token',
      'INVALID_RESET_TOKEN'
    )
  }

  const user = await authRepository.findById(decoded.userId)

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

    const existingUser =
      parsedIdentifier.method === 'email'
        ? await authRepository.findByEmail(parsedIdentifier.value)
        : await authRepository.findByPhone(parsedIdentifier.value)

    // Important:
    // Unverified users should not block the frontend with "already used".
    if (existingUser) {
      const isVerified =
        parsedIdentifier.method === 'email'
          ? existingUser.emailVerified
          : existingUser.phoneVerified

      return {
        available: !isVerified,
        type: parsedIdentifier.method,
        needsVerification: !isVerified,
      }
    }

    return {
      available: true,
      type: parsedIdentifier.method,
      needsVerification: false,
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
  const accessTokenOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }

  const accessToken = jwt.sign(
    {
      userId,
      role,
      type: 'access',
    } as JwtPayload,
    env.JWT_SECRET,
    accessTokenOptions
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

  /**
   * Registration username generation:
   * - Email signup: use the email prefix before "@"
   * - Phone signup: use fullName as the source
   * - If the base is taken, append random numbers or "_numbers"
   * - Max length stays aligned with the User model's 30-char limit
   */
  generateRegistrationUsername: async (data: {
    email?: string
    fullName: string
  }): Promise<string> => {
    const source = data.email
      ? data.email.split('@')[0]
      : data.fullName

    return authService.generateUniqueUsernameFromSource(source)
  },

  /**
   * Kept for backward compatibility with any existing OAuth/passport code
   * that may still call authService.generateUsername(fullName).
   *
   * For OAuth, prefer:
   *   generateRegistrationUsername({ email, fullName })
   */
  generateUsername: async (fullName: string): Promise<string> => {
    return authService.generateUniqueUsernameFromSource(fullName)
  },

  generateUniqueUsernameFromSource: async (
    source: string
  ): Promise<string> => {
    const sanitizedBase =
      source
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 24) || 'user'

    const base =
      sanitizedBase.length >= 3
        ? sanitizedBase
        : `${sanitizedBase}user`.slice(0, 24)

    if (!(await authRepository.usernameExists(base))) {
      return base
    }

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const suffix = crypto.randomInt(10, 100000).toString()
      const separator = attempt % 2 === 0 ? '_' : ''
      const maxBaseLength = 30 - separator.length - suffix.length
      const candidateBase = base.slice(0, Math.max(3, maxBaseLength))
      const candidate = `${candidateBase}${separator}${suffix}`

      if (!(await authRepository.usernameExists(candidate))) {
        return candidate
      }
    }

    throw new ApiError(
      500,
      'Could not generate a unique username. Please try again.',
      'USERNAME_GENERATION_FAILED'
    )
  },

 formatter: (user: OAuthFormattedUserSource): AuthUser => ({
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