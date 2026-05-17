import bcrypt from 'bcryptjs'

import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import type {
  AuthLoginResult,
  LoginPayload,
  RequestMeta,
} from '../../domain/types/auth.types'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'
import { ensureUserCanAuthenticate } from '../services/auth-account-policy.service'
import { sendVerificationOtp } from '../services/verification-otp.service'
import {
  generateTwoFactorChallengeToken,
  issueTokenPair,
  TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
} from '../services/auth-token.service'
import { resolveRedirectPath } from '../services/auth-redirect.service'
import { formatAuthUser } from '../services/auth-user-formatter.service'

export class LoginUserUseCase {
  async execute(
    payload: LoginPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    const parsedIdentifier = normalizeIdentifier(payload.identifier)

    const user = await authRepository.findByIdentifier(payload.identifier)

    if (!user) {
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

    const userId = user._id.toString()

    const twoFactorEnabled =
      await authRepository.hasActiveTwoFactor(userId)

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken: generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
      }
    }

    const redirectPath = await resolveRedirectPath(userId)

    const tokens = await issueTokenPair(
      userId,
      user.role,
      meta
    )

    await authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: formatAuthUser(user),
      redirectPath,
    }
  }
}
