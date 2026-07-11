import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthTwoFactorRepositoryContract } from '../../domain/repositories/auth-two-factor.repository.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import type { AuthRedirectServiceContract } from '../../domain/services/auth-redirect.service.interface'
import type { PasswordHasherServiceContract } from '../../domain/services/password-hasher.service.interface'
import type {
  SecurityAttemptScope,
  SecurityAttemptStoreContract,
} from '../../domain/services/security-attempt-store.interface'
import type {
  AuthLoginResult,
  LoginPayload,
  RequestMeta,
} from '../dtos/auth.dto'
import { TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES } from '../../domain/constants/auth.constants'
import type { AuthUserMapperContract } from '../mappers/auth-user.mapper'
import type { AuthAccountPolicyContract } from '../policies/auth-account-policy.policy'
import type { AuthSessionServiceContract } from '../services/auth-session.service'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'
import type { AuthTokenServiceContract } from '../../domain/services/auth-token.service.interface'
import { createModerationAppealToken } from '../../../../shared/security/moderation-appeal-token.util'

type LoginRepository =
  AuthUserRepositoryContract &
  AuthTwoFactorRepositoryContract

const LOGIN_SCOPE: SecurityAttemptScope = 'auth_login'

export class LoginUserUseCase {
  constructor(
    private readonly _authRepository: LoginRepository,
    private readonly _authNotificationService: AuthNotificationServiceContract,
    private readonly _authRedirectService: AuthRedirectServiceContract,
    private readonly _identifierNormalizer: IdentifierNormalizerContract,
    private readonly _authAccountPolicy: AuthAccountPolicyContract,
    private readonly _authSessionService: AuthSessionServiceContract,
    private readonly _authTokenService: AuthTokenServiceContract,
    private readonly _passwordHasher: PasswordHasherServiceContract,
    private readonly _securityAttemptStore: SecurityAttemptStoreContract,
    private readonly _authUserMapper: AuthUserMapperContract
  ) {}

  async execute(
    payload: LoginPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    const parsedIdentifier =
      this._identifierNormalizer.normalize(payload.identifier)

    await this.throwIfLoginTemporarilyBlocked(parsedIdentifier.value)

    const user = await this._authRepository.findByIdentifier(payload.identifier)

    if (!user) {
      await this.recordLoginFailure(parsedIdentifier.value)

      throw AuthApplicationError.invalidCredentials('Invalid credentials')
    }

    if (!user.passwordHash) {
      throw AuthApplicationError.oauthAccount('This account uses social login. Please sign in with Google or GitHub.')
    }

    const valid = await this._passwordHasher.compare(
      payload.password,
      user.passwordHash
    )

    if (!valid) {
      await this.recordLoginFailure(parsedIdentifier.value)

      throw AuthApplicationError.invalidCredentials('Invalid credentials')
    }

    try {
      this._authAccountPolicy.ensureUserCanAuthenticate(user)
    } catch (error) {
      if (error instanceof AuthApplicationError) {
        throw error.withData({
          appealToken: createModerationAppealToken(
            user.id,
            parsedIdentifier.value,
          ),
        })
      }

      throw error
    }

    await this._securityAttemptStore.clear(
      LOGIN_SCOPE,
      parsedIdentifier.value
    )

    if (parsedIdentifier.method === 'email' && !user.emailVerified) {
      await this._authNotificationService.sendVerificationOtp({
        email: parsedIdentifier.email!,
        method: 'email',
      })

      throw AuthApplicationError.emailNotVerified('Please verify your email before signing in. A new OTP has been sent.')
    }

    if (parsedIdentifier.method === 'phone' && !user.phoneVerified) {
      await this._authNotificationService.sendVerificationOtp({
        phone: parsedIdentifier.phone!,
        method: 'phone',
      })

      throw AuthApplicationError.phoneNotVerified('Please verify your phone before signing in. A new OTP has been sent.')
    }

    const userId = user.id

    const twoFactorEnabled =
      await this._authRepository.hasActiveTwoFactor(userId)

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken:
          this._authTokenService.generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
      }
    }

    const recoveredUser =
      await this._authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? user

    const redirectPath =
      await this._authRedirectService.resolveRedirectPath(userId)

    const tokens = await this._authSessionService.issueTokenPair(
      userId,
      user.role,
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

  private async throwIfLoginTemporarilyBlocked(
    identifier: string
  ): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(
      LOGIN_SCOPE,
      identifier
    )

    if (!blocked) return

    const retryAfterSeconds =
      await this._securityAttemptStore.getRetryAfterSeconds(
        LOGIN_SCOPE,
        identifier
      )

    throw AuthApplicationError.loginTemporarilyBlocked(retryAfterSeconds > 0
        ? `Too many failed login attempts. Try again in about ${Math.ceil(
            retryAfterSeconds / 60
          )} minute(s).`
        : 'Too many failed login attempts. Please try again later.')
  }

  private async recordLoginFailure(identifier: string): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      LOGIN_SCOPE,
      identifier,
      'authLogin'
    )

    if (result.blocked) {
      throw AuthApplicationError.loginTemporarilyBlocked('Too many failed login attempts. Please try again later.')
    }
  }
}
