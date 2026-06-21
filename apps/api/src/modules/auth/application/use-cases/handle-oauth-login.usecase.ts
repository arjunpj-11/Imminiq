import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthTwoFactorRepositoryContract } from '../../domain/repositories/auth-two-factor.repository.interface'
import type { AuthRedirectServiceContract } from '../../domain/services/auth-redirect.service.interface'
import type { AuthTokenServiceContract } from '../../domain/services/auth-token.service.interface'
import type { AuthLoginResult, OAuthLoginUser, RequestMeta } from '../dtos/auth.dto'
import { TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES } from '../../domain/constants/auth.constants'
import type { AuthUserMapperContract } from '../mappers/auth-user.mapper'
import type { AuthAccountPolicyContract } from '../policies/auth-account-policy.policy'
import type { AuthSessionServiceContract } from '../services/auth-session.service'

type OAuthLoginRepository = AuthUserRepositoryContract & AuthTwoFactorRepositoryContract

export class HandleOAuthLoginUseCase {
  constructor(
    private readonly authRepository: OAuthLoginRepository,
    private readonly authRedirectService: AuthRedirectServiceContract,
    private readonly authTokenService: AuthTokenServiceContract,
    private readonly authAccountPolicy: AuthAccountPolicyContract,
    private readonly authSessionService: AuthSessionServiceContract,
    private readonly authUserMapper: AuthUserMapperContract
  ) {}

  async execute(
    user: OAuthLoginUser,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    const userId = this.resolveOAuthUserId(user)

    const dbUser = await this.authRepository.findById(userId)

    if (!dbUser) {
      throw AuthApplicationError.notFound('User not found')
    }

    this.authAccountPolicy.ensureUserCanAuthenticate(dbUser)

    const twoFactorEnabled =
      await this.authRepository.hasActiveTwoFactor(userId)

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken: this.authTokenService.generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
      }
    }

    const recoveredUser =
      await this.authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? dbUser

    const redirectPath =
      await this.authRedirectService.resolveRedirectPath(userId)

    const tokens = await this.authSessionService.issueTokenPair(
      userId,
      authenticatedUser.role,
      meta
    )

    await this.authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: this.authUserMapper.toAuthUser(authenticatedUser),
      redirectPath,
    }
  }

  private resolveOAuthUserId(user: OAuthLoginUser): string {
    if (typeof user._id === 'string') {
      return user._id
    }

    if (user._id) {
      return user._id.toString()
    }

    if (user.id) {
      return user.id
    }

    throw AuthApplicationError.notFound('User not found')
  }
}
