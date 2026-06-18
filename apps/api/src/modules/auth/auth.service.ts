import type {
  AuthLoginResult,
  AuthLoginSuccessResult,
  AuthUser,
  LoginPayload,
  OAuthLoginUser,
  RegisterPayload,
  RequestMeta,
  TokenPair,
  TwoFactorLoginVerifyPayload,
} from './application/dtos/auth.dto'
import type { AuthRole } from './domain/value-objects/auth-role.vo'
import type { OtpPurpose } from './domain/value-objects/otp-purpose.vo'

import { mongoAuthRepository } from './infrastructure/repositories/mongo-auth.repository'
import { bcryptPasswordHasherService } from './infrastructure/services/bcrypt-password-hasher.service'
import { cryptoOtpGeneratorService } from './infrastructure/services/crypto-otp-generator.service'
import { cryptoRandomNumberGeneratorService } from './infrastructure/services/crypto-random-number-generator.service'
import { jwtAuthTokenService } from './infrastructure/services/jwt-auth-token.service'
import { jwtPasswordResetTokenService } from './infrastructure/services/jwt-password-reset-token.service'
import { otplibTwoFactorCodeVerifierService } from './infrastructure/services/otplib-two-factor-code-verifier.service'
import { redisPasswordResetSessionStore } from './infrastructure/stores/redis-password-reset-session.store'
import { redisSecurityAttemptStore } from './infrastructure/stores/redis-security-attempt.store'
import { redisPhoneOtpSessionStore } from './infrastructure/stores/redis-phone-otp-session.store'
import { redisRetiredRefreshTokenStore } from './infrastructure/stores/redis-retired-refresh-token.store'
import { redisOtpStore } from './infrastructure/stores/redis-otp.store'
import { messageCentralPhoneOtpProvider } from './infrastructure/providers/message-central-phone-otp.provider'
import { nodemailerOtpEmailProvider } from './infrastructure/providers/nodemailer-otp-email.provider'
import { securityAuditLogger } from './infrastructure/loggers/security-audit.logger'

import { RegisterUserUseCase } from './application/use-cases/register-user.usecase'
import { LoginUserUseCase } from './application/use-cases/login-user.usecase'
import { HandleOAuthLoginUseCase } from './application/use-cases/handle-oauth-login.usecase'
import { VerifyTwoFactorLoginUseCase } from './application/use-cases/verify-two-factor-login.usecase'
import { LogoutUserUseCase } from './application/use-cases/logout-user.usecase'
import { LogoutAllSessionsUseCase } from './application/use-cases/logout-all-sessions.usecase'
import { RefreshAuthTokensUseCase } from './application/use-cases/refresh-auth-tokens.usecase'
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.usecase'
import { VerifyAccountUseCase } from './application/use-cases/verify-account.usecase'
import { ResendOtpUseCase } from './application/use-cases/resend-otp.usecase'
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.usecase'
import { VerifyResetCodeUseCase } from './application/use-cases/verify-reset-code.usecase'
import { ResetPasswordUseCase } from './application/use-cases/reset-password.usecase'
import { ChangePasswordUseCase } from './application/use-cases/change-password.usecase'
import { CheckIdentifierUseCase } from './application/use-cases/check-identifier.usecase'
import { CheckUsernameUseCase } from './application/use-cases/check-username.usecase'
import { GetAuthSessionsUseCase } from './application/use-cases/get-auth-sessions.usecase'
import { RevokeAuthSessionUseCase } from './application/use-cases/revoke-auth-session.usecase'

import {
  AuthUserMapper,
  type AuthUserMapperContract,
} from './application/mappers/auth-user.mapper'
import {
  AuthAccountPolicyService,
  type AuthAccountPolicyContract,
} from './application/policies/auth-account-policy.policy'
import {
  AuthNotificationService,
} from './application/services/auth-notification.service'
import {
  AuthRedirectService,
} from './application/services/auth-redirect.service'
import {
  AuthSessionService,
  type AuthSessionServiceContract,
} from './application/services/auth-session.service'
import {
  BackupCodeNormalizerService,
  type BackupCodeNormalizerServiceContract,
} from './application/services/backup-code-normalizer.service'
import { IdentifierNormalizerService } from './application/services/identifier-normalizer.service'
import {
  UsernameGeneratorService,
  type UsernameGeneratorServiceContract,
} from './application/services/username-generator.service'

import type { AuthRepositoryContract } from './domain/repositories/auth.repository.interface'
import type { AuthNotificationServiceContract } from './domain/services/auth-notification.service.interface'
import type { AuthRedirectServiceContract } from './domain/services/auth-redirect.service.interface'
import type { AuthTokenServiceContract } from './domain/services/auth-token.service.interface'
import type { IdentifierNormalizerContract } from './domain/services/identifier-normalizer.service.interface'
import type { OtpGeneratorContract } from './domain/services/otp-generator.service.interface'
import type { OtpStoreContract } from './domain/services/otp-store.interface'
import type { PasswordHasherServiceContract } from './domain/services/password-hasher.service.interface'
import type { PasswordResetSessionStoreContract } from './domain/services/password-reset-session-store.interface'
import type { PasswordResetTokenServiceContract } from './domain/services/password-reset-token.service.interface'
import type { PhoneOtpProviderContract } from './domain/services/phone-otp-provider.interface'
import type { PhoneOtpSessionStoreContract } from './domain/services/phone-otp-session-store.interface'
import type { RetiredRefreshTokenStoreContract } from './domain/services/retired-refresh-token-store.interface'
import type { SecurityAttemptStoreContract } from './domain/services/security-attempt-store.interface'
import type { SecurityAuditLoggerContract } from './domain/services/security-audit-logger.interface'
import type { TwoFactorCodeVerifierContract } from './domain/services/two-factor-code-verifier.interface'

export class AuthService {
  private readonly registerUserUseCase: RegisterUserUseCase
  private readonly loginUserUseCase: LoginUserUseCase
  private readonly handleOAuthLoginUseCase: HandleOAuthLoginUseCase
  private readonly verifyTwoFactorLoginUseCase: VerifyTwoFactorLoginUseCase
  private readonly logoutUserUseCase: LogoutUserUseCase
  private readonly logoutAllSessionsUseCase: LogoutAllSessionsUseCase
  private readonly refreshAuthTokensUseCase: RefreshAuthTokensUseCase
  private readonly getCurrentUserUseCase: GetCurrentUserUseCase
  private readonly verifyAccountUseCase: VerifyAccountUseCase
  private readonly resendOtpUseCase: ResendOtpUseCase
  private readonly forgotPasswordUseCase: ForgotPasswordUseCase
  private readonly verifyResetCodeUseCase: VerifyResetCodeUseCase
  private readonly resetPasswordUseCase: ResetPasswordUseCase
  private readonly changePasswordUseCase: ChangePasswordUseCase
  private readonly checkIdentifierUseCase: CheckIdentifierUseCase
  private readonly checkUsernameUseCase: CheckUsernameUseCase
  private readonly getAuthSessionsUseCase: GetAuthSessionsUseCase
  private readonly revokeAuthSessionUseCase: RevokeAuthSessionUseCase

  constructor(
    private readonly authRepository: AuthRepositoryContract,
    private readonly authUserMapper: AuthUserMapperContract,
    private readonly identifierNormalizer: IdentifierNormalizerContract,
    private readonly otpGenerator: OtpGeneratorContract,
    private readonly usernameGenerator: UsernameGeneratorServiceContract,
    private readonly authAccountPolicy: AuthAccountPolicyContract,
    private readonly backupCodeNormalizer: BackupCodeNormalizerServiceContract,
    private readonly passwordHasher: PasswordHasherServiceContract,
    private readonly authTokenService: AuthTokenServiceContract,
    private readonly passwordResetSessionStore: PasswordResetSessionStoreContract,
    private readonly passwordResetTokenService: PasswordResetTokenServiceContract,
    private readonly securityAttemptStore: SecurityAttemptStoreContract,
    private readonly phoneOtpSessionStore: PhoneOtpSessionStoreContract,
    private readonly phoneOtpProvider: PhoneOtpProviderContract,
    private readonly retiredRefreshTokenStore: RetiredRefreshTokenStoreContract,
    private readonly otpStore: OtpStoreContract,
    private readonly securityAuditLogger: SecurityAuditLoggerContract,
    private readonly twoFactorCodeVerifier: TwoFactorCodeVerifierContract,
    private readonly authNotificationService: AuthNotificationServiceContract,
    private readonly authRedirectService: AuthRedirectServiceContract,
    private readonly authSessionService: AuthSessionServiceContract
  ) {
    this.registerUserUseCase = new RegisterUserUseCase(
      this.authRepository,
      this.authNotificationService,
      this.identifierNormalizer,
      this.usernameGenerator,
      this.passwordHasher,
      this.authUserMapper
    )

    this.loginUserUseCase = new LoginUserUseCase(
      this.authRepository,
      this.authNotificationService,
      this.authRedirectService,
      this.identifierNormalizer,
      this.authAccountPolicy,
      this.authSessionService,
      this.authTokenService,
      this.passwordHasher,
      this.securityAttemptStore,
      this.authUserMapper
    )

    this.handleOAuthLoginUseCase = new HandleOAuthLoginUseCase(
      this.authRepository,
      this.authRedirectService,
      this.authTokenService,
      this.authAccountPolicy,
      this.authSessionService,
      this.authUserMapper
    )

    this.verifyTwoFactorLoginUseCase = new VerifyTwoFactorLoginUseCase(
      this.authRepository,
      this.authRedirectService,
      this.authTokenService,
      this.authAccountPolicy,
      this.authSessionService,
      this.securityAttemptStore,
      this.twoFactorCodeVerifier,
      this.backupCodeNormalizer,
      this.passwordHasher,
      this.authUserMapper
    )

    this.logoutUserUseCase = new LogoutUserUseCase(this.authRepository)

    this.logoutAllSessionsUseCase =
      new LogoutAllSessionsUseCase(this.authRepository)

    this.refreshAuthTokensUseCase = new RefreshAuthTokensUseCase(
      this.authRepository,
      this.authTokenService,
      this.retiredRefreshTokenStore,
      this.securityAuditLogger,
      this.authAccountPolicy
    )

    this.getCurrentUserUseCase = new GetCurrentUserUseCase(
      this.authRepository,
      this.authAccountPolicy,
      this.authUserMapper
    )

    this.verifyAccountUseCase = new VerifyAccountUseCase(
      this.authRepository,
      this.identifierNormalizer,
      this.securityAttemptStore,
      this.phoneOtpProvider,
      this.phoneOtpSessionStore,
      this.otpStore
    )

    this.resendOtpUseCase = new ResendOtpUseCase(
      this.authRepository,
      this.authNotificationService,
      this.identifierNormalizer
    )

    this.forgotPasswordUseCase = new ForgotPasswordUseCase(
      this.authRepository,
      this.authNotificationService,
      this.identifierNormalizer
    )

    this.verifyResetCodeUseCase = new VerifyResetCodeUseCase(
      this.authRepository,
      this.identifierNormalizer,
      this.securityAttemptStore,
      this.phoneOtpProvider,
      this.phoneOtpSessionStore,
      this.passwordResetTokenService,
      this.otpStore
    )

    this.resetPasswordUseCase = new ResetPasswordUseCase(
      this.authRepository,
      this.passwordResetTokenService,
      this.passwordResetSessionStore,
      this.securityAuditLogger,
      this.passwordHasher
    )

    this.changePasswordUseCase = new ChangePasswordUseCase(
      this.authRepository,
      this.passwordHasher
    )

    this.checkIdentifierUseCase = new CheckIdentifierUseCase(
      this.authRepository,
      this.identifierNormalizer
    )

    this.checkUsernameUseCase =
      new CheckUsernameUseCase(this.authRepository)

    this.getAuthSessionsUseCase =
      new GetAuthSessionsUseCase(this.authRepository)

    this.revokeAuthSessionUseCase =
      new RevokeAuthSessionUseCase(this.authRepository)
  }

  register(payload: RegisterPayload) {
    return this.registerUserUseCase.execute(payload)
  }

  login(
    payload: LoginPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    return this.loginUserUseCase.execute(payload, meta)
  }

  handleOAuthLogin(
    user: OAuthLoginUser,
    meta?: RequestMeta
  ): Promise<AuthLoginResult> {
    return this.handleOAuthLoginUseCase.execute(user, meta)
  }

  verifyTwoFactorLogin(
    challengeToken: string,
    payload: TwoFactorLoginVerifyPayload,
    meta?: RequestMeta
  ): Promise<AuthLoginSuccessResult> {
    return this.verifyTwoFactorLoginUseCase.execute(
      challengeToken,
      payload,
      meta
    )
  }

  logout(refreshToken: string) {
    return this.logoutUserUseCase.execute(refreshToken)
  }

  logoutAll(userId: string) {
    return this.logoutAllSessionsUseCase.execute(userId)
  }

  refreshTokens(
    refreshToken: string,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    return this.refreshAuthTokensUseCase.execute(refreshToken, meta)
  }

  getMe(userId: string): Promise<AuthUser> {
    return this.getCurrentUserUseCase.execute(userId)
  }

  verifyAccount(identifier: string, otp: string) {
    return this.verifyAccountUseCase.execute(identifier, otp)
  }

  resendOtp(identifier: string, purpose: OtpPurpose) {
    return this.resendOtpUseCase.execute(identifier, purpose)
  }

  forgotPassword(identifier: string) {
    return this.forgotPasswordUseCase.execute(identifier)
  }

  verifyResetCode(identifier: string, otp: string) {
    return this.verifyResetCodeUseCase.execute(identifier, otp)
  }

  resetPassword(resetToken: string, newPassword: string) {
    return this.resetPasswordUseCase.execute(resetToken, newPassword)
  }

  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    return this.changePasswordUseCase.execute(
      userId,
      currentPassword,
      newPassword
    )
  }

  checkIdentifier(identifier: string) {
    return this.checkIdentifierUseCase.execute(identifier)
  }

  checkUsername(username: string) {
    return this.checkUsernameUseCase.execute(username)
  }

  getSessions(userId: string) {
    return this.getAuthSessionsUseCase.execute(userId)
  }

  revokeSession(userId: string, sessionId: string) {
    return this.revokeAuthSessionUseCase.execute(userId, sessionId)
  }

  generateTokenPair(
    userId: string,
    role: AuthRole,
    meta?: RequestMeta
  ): Promise<TokenPair> {
    return this.authSessionService.issueTokenPair(userId, role, meta)
  }

  generateTwoFactorChallengeToken(userId: string): string {
    return this.authTokenService.generateTwoFactorChallengeToken(userId)
  }

  generateOtp(): string {
    return this.otpGenerator.generate()
  }

  generateRegistrationUsername(data: {
    email?: string
    fullName: string
  }) {
    return this.usernameGenerator.generateRegistrationUsername(data)
  }

  generateUsername(fullName: string) {
    return this.usernameGenerator.generateUsername(fullName)
  }

  generateUniqueUsernameFromSource(source: string) {
    return this.usernameGenerator.generateUniqueUsernameFromSource(source)
  }

  formatter(user: Parameters<AuthUserMapperContract['toAuthUser']>[0]) {
    return this.authUserMapper.toAuthUser(user)
  }
}

const authRepository = mongoAuthRepository
const authUserMapper = new AuthUserMapper()
const identifierNormalizer = new IdentifierNormalizerService()
const otpGenerator = cryptoOtpGeneratorService
const usernameGenerator = new UsernameGeneratorService(
  authRepository,
  cryptoRandomNumberGeneratorService
)
const authAccountPolicy = new AuthAccountPolicyService()
const backupCodeNormalizer = new BackupCodeNormalizerService()

const passwordHasher = bcryptPasswordHasherService
const authTokenService = jwtAuthTokenService
const passwordResetSessionStore = redisPasswordResetSessionStore
const passwordResetTokenService = jwtPasswordResetTokenService
const securityAttemptStore = redisSecurityAttemptStore
const phoneOtpSessionStore = redisPhoneOtpSessionStore
const phoneOtpProvider = messageCentralPhoneOtpProvider
const retiredRefreshTokenStore = redisRetiredRefreshTokenStore
const otpStore = redisOtpStore
const securityAuditLoggerService = securityAuditLogger
const twoFactorCodeVerifier = otplibTwoFactorCodeVerifierService
const authRedirectService = new AuthRedirectService()

const authNotificationService = new AuthNotificationService(
  otpStore,
  otpGenerator,
  identifierNormalizer,
  phoneOtpProvider,
  phoneOtpSessionStore,
  nodemailerOtpEmailProvider
)

const authSessionService = new AuthSessionService(
  authRepository,
  authTokenService
)

export const authService = new AuthService(
  authRepository,
  authUserMapper,
  identifierNormalizer,
  otpGenerator,
  usernameGenerator,
  authAccountPolicy,
  backupCodeNormalizer,
  passwordHasher,
  authTokenService,
  passwordResetSessionStore,
  passwordResetTokenService,
  securityAttemptStore,
  phoneOtpSessionStore,
  phoneOtpProvider,
  retiredRefreshTokenStore,
  otpStore,
  securityAuditLoggerService,
  twoFactorCodeVerifier,
  authNotificationService,
  authRedirectService,
  authSessionService
)

export type { OAuthLoginUser } from './application/dtos/auth.dto'
