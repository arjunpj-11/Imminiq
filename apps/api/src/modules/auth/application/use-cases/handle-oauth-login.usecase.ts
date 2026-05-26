import { ApiError } from '../../../../shared/utils/ApiError'
import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import type { AuthRedirectServiceContract } from '../../domain/services/auth-redirect.service.interface'
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
import { formatAuthUser } from '../services/auth-user-formatter.service'

export class HandleOAuthLoginUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract,
    private readonly authRedirectService: AuthRedirectServiceContract
  ) {}

  async execute(
    user: OAuthLoginUser,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    const userId = user._id.toString()

    const dbUser = await this.authRepository.findById(userId)

    if (!dbUser) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    ensureUserCanAuthenticate(dbUser)

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

    const authenticatedUser = recoveredUser ?? dbUser

    const redirectPath =
      await this.authRedirectService.resolveRedirectPath(userId)

    const tokens = await issueTokenPair(
      this.authRepository,
      userId,
      authenticatedUser.role,
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
