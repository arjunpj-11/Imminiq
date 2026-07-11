import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthTwoFactorRepositoryContract } from '../../domain/repositories/auth-two-factor.repository.interface'
import type { AuthRedirectResolverContract } from '../../domain/services/auth-redirect.interface'
import type { AuthTokenContract } from '../../domain/services/auth-token.interface'
import type { AuthLoginResult, OAuthLoginUser, RequestMeta } from '../dtos/auth.dto'
import { TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES } from '../../domain/constants/auth.constants'
import type { AuthUserMapperContract } from '../mappers/auth-user.mapper'
import type { AuthAccountPolicyContract } from '../policies/auth-account-policy.policy'
import type { AuthSessionIssuerContract } from '../services/auth-session.service'

type OAuthLoginRepository = AuthUserRepositoryContract & AuthTwoFactorRepositoryContract

export class HandleOAuthLoginUseCase {
  constructor(
    private readonly _authRepository: OAuthLoginRepository,
    private readonly _authRedirectResolver: AuthRedirectResolverContract,
    private readonly _authToken: AuthTokenContract,
    private readonly _authAccountPolicy: AuthAccountPolicyContract,
    private readonly _authSessionIssuer: AuthSessionIssuerContract,
    private readonly _authUserMapper: AuthUserMapperContract
  ) {}

  async execute(
    user: OAuthLoginUser,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    const userId = this.resolveOAuthUserId(user)

    const dbUser = await this._authRepository.findById(userId)

    if (!dbUser) {
      throw AuthApplicationError.notFound('User not found')
    }

    this._authAccountPolicy.ensureUserCanAuthenticate(dbUser)

    const twoFactorEnabled =
      await this._authRepository.hasActiveTwoFactor(userId)

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken: this._authToken.generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
      }
    }

    const recoveredUser =
      await this._authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? dbUser

    const redirectPath =
      await this._authRedirectResolver.resolveRedirectPath(userId)

    const tokens = await this._authSessionIssuer.issueTokenPair(
      userId,
      authenticatedUser.role,
      meta
    )

    await this._authRepository.updateLastActive(userId)

    return {
      requiresTwoFactor: false,
      tokens,
      user: this._authUserMapper.toAuthUser(authenticatedUser),
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
