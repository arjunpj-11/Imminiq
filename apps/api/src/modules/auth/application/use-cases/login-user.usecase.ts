import bcrypt from 'bcryptjs'

import { ApiError } from '../../../../shared/utils/ApiError'
import {
  SECURITY_ATTEMPT_POLICIES,
  securityAttemptCache,
} from '../../../../infrastructure/cache/security-attempt.cache'
import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import type { AuthRedirectServiceContract } from '../../domain/services/auth-redirect.service.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import type {
  AuthLoginResult,
  LoginPayload,
  RequestMeta,
} from '../../domain/types/auth.types'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'
import { ensureUserCanAuthenticate } from '../services/auth-account-policy.service'
import {
  generateTwoFactorChallengeToken,
  issueTokenPair,
  TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
} from '../services/auth-token.service'
import { formatAuthUser } from '../services/auth-user-formatter.service'

const LOGIN_SCOPE = 'auth_login' as const

const throwIfLoginTemporarilyBlocked = async (
  identifier: string
) => {
  const blocked = await securityAttemptCache.isBlocked(
    LOGIN_SCOPE,
    identifier
  )

  if (!blocked) return

  const retryAfterSeconds =
    await securityAttemptCache.getRetryAfterSeconds(
      LOGIN_SCOPE,
      identifier
    )

  throw new ApiError(
    429,
    retryAfterSeconds > 0
      ? `Too many failed login attempts. Try again in about ${Math.ceil(
          retryAfterSeconds / 60
        )} minute(s).`
      : 'Too many failed login attempts. Please try again later.',
    'LOGIN_TEMPORARILY_BLOCKED'
  )
}

const recordLoginFailure = async (
  identifier: string
) => {
  const result = await securityAttemptCache.recordFailure(
    LOGIN_SCOPE,
    identifier,
    SECURITY_ATTEMPT_POLICIES.authLogin
  )

  if (result.blocked) {
    throw new ApiError(
      429,
      'Too many failed login attempts. Please try again later.',
      'LOGIN_TEMPORARILY_BLOCKED'
    )
  }
}

export class LoginUserUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract,
    private readonly authNotificationService: AuthNotificationServiceContract,
    private readonly authRedirectService: AuthRedirectServiceContract
  ) {}

  async execute(
    payload: LoginPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    const parsedIdentifier = normalizeIdentifier(payload.identifier)

    await throwIfLoginTemporarilyBlocked(parsedIdentifier.value)

    const user = await this.authRepository.findByIdentifier(payload.identifier)

    if (!user) {
      await recordLoginFailure(parsedIdentifier.value)

      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
    }

    ensureUserCanAuthenticate(user)

    if (!user.passwordHash) {
      throw new ApiError(
        400,
        'This account uses social login. Please sign in with Google or GitHub.',
        'OAUTH_ACCOUNT'
      )
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash)

    if (!valid) {
      await recordLoginFailure(parsedIdentifier.value)

      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
    }

    await securityAttemptCache.clear(
      LOGIN_SCOPE,
      parsedIdentifier.value
    )

    if (parsedIdentifier.method === 'email' && !user.emailVerified) {
      await this.authNotificationService.sendVerificationOtp({
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
      await this.authNotificationService.sendVerificationOtp({
        phone: parsedIdentifier.phone,
        method: 'phone',
      })

      throw new ApiError(
        403,
        'Please verify your phone before signing in. A new OTP has been sent.',
        'PHONE_NOT_VERIFIED'
      )
    }

    const userId = user._id.toString()

    const twoFactorEnabled =
      await this.authRepository.hasActiveTwoFactor(userId)

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken: generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
      }
    }

    const recoveredUser =
      await this.authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? user

    const redirectPath =
      await this.authRedirectService.resolveRedirectPath(userId)

    const tokens = await issueTokenPair(
      this.authRepository,
      userId,
      user.role,
      meta
    )

    await this.authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: formatAuthUser(authenticatedUser),
      redirectPath,
    }
  }
}
