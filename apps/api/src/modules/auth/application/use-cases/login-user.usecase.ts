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

type LoginRepository =
  AuthUserRepositoryContract &
  AuthTwoFactorRepositoryContract

const LOGIN_SCOPE: SecurityAttemptScope = 'auth_login'

export class LoginUserUseCase {
  constructor(
    private readonly authRepository: LoginRepository,
    private readonly authNotificationService: AuthNotificationServiceContract,
    private readonly authRedirectService: AuthRedirectServiceContract,
    private readonly identifierNormalizer: IdentifierNormalizerContract,
    private readonly authAccountPolicy: AuthAccountPolicyContract,
    private readonly authSessionService: AuthSessionServiceContract,
    private readonly authTokenService: AuthTokenServiceContract,
    private readonly passwordHasher: PasswordHasherServiceContract,
    private readonly securityAttemptStore: SecurityAttemptStoreContract,
    private readonly authUserMapper: AuthUserMapperContract
  ) {}

  async execute(
    payload: LoginPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    const parsedIdentifier =
      this.identifierNormalizer.normalize(payload.identifier)

    await this.throwIfLoginTemporarilyBlocked(parsedIdentifier.value)

    const user = await this.authRepository.findByIdentifier(payload.identifier)

    if (!user) {
      await this.recordLoginFailure(parsedIdentifier.value)

      throw AuthApplicationError.invalidCredentials('Invalid credentials')
    }

    this.authAccountPolicy.ensureUserCanAuthenticate(user)

    if (!user.passwordHash) {
      throw AuthApplicationError.oauthAccount('This account uses social login. Please sign in with Google or GitHub.')
    }

    const valid = await this.passwordHasher.compare(
      payload.password,
      user.passwordHash
    )

    if (!valid) {
      await this.recordLoginFailure(parsedIdentifier.value)

      throw AuthApplicationError.invalidCredentials('Invalid credentials')
    }

    await this.securityAttemptStore.clear(
      LOGIN_SCOPE,
      parsedIdentifier.value
    )

    if (parsedIdentifier.method === 'email' && !user.emailVerified) {
      await this.authNotificationService.sendVerificationOtp({
        email: parsedIdentifier.email!,
        method: 'email',
      })

      throw AuthApplicationError.emailNotVerified('Please verify your email before signing in. A new OTP has been sent.')
    }

    if (parsedIdentifier.method === 'phone' && !user.phoneVerified) {
      await this.authNotificationService.sendVerificationOtp({
        phone: parsedIdentifier.phone!,
        method: 'phone',
      })

      throw AuthApplicationError.phoneNotVerified('Please verify your phone before signing in. A new OTP has been sent.')
    }

    const userId = user.id

    const twoFactorEnabled =
      await this.authRepository.hasActiveTwoFactor(userId)

    if (twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        challengeToken:
          this.authTokenService.generateTwoFactorChallengeToken(userId),
        challengeExpiresInMinutes: TWO_FACTOR_CHALLENGE_EXPIRES_MINUTES,
      }
    }

    const recoveredUser =
      await this.authRepository.cancelScheduledDeletionIfRecoverable(userId)

    const authenticatedUser = recoveredUser ?? user

    const redirectPath =
      await this.authRedirectService.resolveRedirectPath(userId)

    const tokens = await this.authSessionService.issueTokenPair(
      userId,
      user.role,
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

  private async throwIfLoginTemporarilyBlocked(
    identifier: string
  ): Promise<void> {
    const blocked = await this.securityAttemptStore.isBlocked(
      LOGIN_SCOPE,
      identifier
    )

    if (!blocked) return

    const retryAfterSeconds =
      await this.securityAttemptStore.getRetryAfterSeconds(
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
    const result = await this.securityAttemptStore.recordFailure(
      LOGIN_SCOPE,
      identifier,
      'authLogin'
    )

    if (result.blocked) {
      throw AuthApplicationError.loginTemporarilyBlocked('Too many failed login attempts. Please try again later.')
    }
  }
}