import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'

import type {
  AuthLoginResult,
  OAuthLoginUser,
  RequestMeta,
} from '../../domain/types/auth.types'

import { ensureUserCanAuthenticate } from '../services/auth-account-policy.service'
import {
  generateTwoFactorChallengeToken,
  issueTokenPair,
  TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
} from '../services/auth-token.service'
import { resolveRedirectPath } from '../services/auth-redirect.service'
import { formatAuthUser } from '../services/auth-user-formatter.service'

export class HandleOAuthLoginUseCase {
  async execute(
    user: OAuthLoginUser,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    const userId = user._id.toString()

    const dbUser = await authRepository.findById(userId)

    if (!dbUser) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    ensureUserCanAuthenticate(dbUser)

    const twoFactorEnabled =
      await authRepository.hasActiveTwoFactor(userId)

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken: generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
      }
    }

    const recoveredUser =
      await authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? dbUser

    const redirectPath = await resolveRedirectPath(userId)

    const tokens = await issueTokenPair(
      userId,
      authenticatedUser.role,
      meta
    )

    await authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: formatAuthUser(authenticatedUser),
      redirectPath,
    }
  }
}