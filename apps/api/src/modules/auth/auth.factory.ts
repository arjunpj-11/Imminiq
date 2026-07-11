import { AuthUserMapper, type AuthUserMapperContract } from './application/mappers/auth-user.mapper'
import { AuthSessionMapper } from './application/mappers/auth-session.mapper'
import { AuthAccountPolicyService } from './application/policies/auth-account-policy.policy'
import { AuthNotificationService } from './application/services/auth-notification.service'
import { AuthRedirectService } from './application/services/auth-redirect.service'
import { AuthSessionService, type AuthSessionServiceContract } from './application/services/auth-session.service'
import { BackupCodeNormalizerService } from './application/services/backup-code-normalizer.service'
import { IdentifierNormalizerService } from './application/services/identifier-normalizer.service'
import { UsernameGeneratorService, type UsernameGeneratorServiceContract } from './application/services/username-generator.service'

import { ChangePasswordUseCase } from './application/use-cases/change-password.usecase'
import { CheckIdentifierUseCase } from './application/use-cases/check-identifier.usecase'
import { CheckUsernameUseCase } from './application/use-cases/check-username.usecase'
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.usecase'
import { GetAuthSessionsUseCase } from './application/use-cases/get-auth-sessions.usecase'
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.usecase'
import { HandleOAuthLoginUseCase } from './application/use-cases/handle-oauth-login.usecase'
import { LoginUserUseCase } from './application/use-cases/login-user.usecase'
import { LogoutAllSessionsUseCase } from './application/use-cases/logout-all-sessions.usecase'
import { LogoutUserUseCase } from './application/use-cases/logout-user.usecase'
import { RefreshAuthTokensUseCase } from './application/use-cases/refresh-auth-tokens.usecase'
import { RegisterUserUseCase } from './application/use-cases/register-user.usecase'
import { ResendOtpUseCase } from './application/use-cases/resend-otp.usecase'
import { ResetPasswordUseCase } from './application/use-cases/reset-password.usecase'
import { RevokeAuthSessionUseCase } from './application/use-cases/revoke-auth-session.usecase'
import { VerifyAccountUseCase } from './application/use-cases/verify-account.usecase'
import { VerifyResetCodeUseCase } from './application/use-cases/verify-reset-code.usecase'
import { VerifyTwoFactorLoginUseCase } from './application/use-cases/verify-two-factor-login.usecase'

import type { AuthTokenServiceContract } from './domain/services/auth-token.service.interface'
import type { OtpGeneratorContract } from './domain/services/otp-generator.service.interface'

import { mongoAuthRepository } from './infrastructure/repositories/mongo-auth.repository'
import { bcryptPasswordHasherService } from './infrastructure/services/bcrypt-password-hasher.service'
import { cryptoOtpGeneratorService } from './infrastructure/services/crypto-otp-generator.service'
import { cryptoRandomNumberGeneratorService } from './infrastructure/services/crypto-random-number-generator.service'
import { jwtAuthTokenService } from './infrastructure/services/jwt-auth-token.service'
import { jwtPasswordResetTokenService } from './infrastructure/services/jwt-password-reset-token.service'
import { otplibTwoFactorCodeVerifierService } from './infrastructure/services/otplib-two-factor-code-verifier.service'
import { securityAuditLogger } from './infrastructure/loggers/security-audit.logger'
import { messageCentralPhoneOtpProvider } from './infrastructure/providers/message-central-phone-otp.provider'
import { nodemailerOtpEmailProvider } from './infrastructure/providers/nodemailer-otp-email.provider'
import { redisOtpStore } from './infrastructure/stores/redis-otp.store'
import { redisPasswordResetSessionStore } from './infrastructure/stores/redis-password-reset-session.store'
import { redisPhoneOtpSessionStore } from './infrastructure/stores/redis-phone-otp-session.store'
import { redisRetiredRefreshTokenStore } from './infrastructure/stores/redis-retired-refresh-token.store'
import { redisSecurityAttemptStore } from './infrastructure/stores/redis-security-attempt.store'

export type AuthUseCases = {
  registerUser: RegisterUserUseCase
  loginUser: LoginUserUseCase
  handleOAuthLogin: HandleOAuthLoginUseCase
  verifyTwoFactorLogin: VerifyTwoFactorLoginUseCase
  logoutUser: LogoutUserUseCase
  logoutAllSessions: LogoutAllSessionsUseCase
  refreshAuthTokens: RefreshAuthTokensUseCase
  getCurrentUser: GetCurrentUserUseCase
  verifyAccount: VerifyAccountUseCase
  resendOtp: ResendOtpUseCase
  forgotPassword: ForgotPasswordUseCase
  verifyResetCode: VerifyResetCodeUseCase
  resetPassword: ResetPasswordUseCase
  changePassword: ChangePasswordUseCase
  checkIdentifier: CheckIdentifierUseCase
  checkUsername: CheckUsernameUseCase
  getAuthSessions: GetAuthSessionsUseCase
  revokeAuthSession: RevokeAuthSessionUseCase
}

export type AuthServiceHelpers = {
  authUserMapper: AuthUserMapperContract
  authTokenService: AuthTokenServiceContract
  otpGenerator: OtpGeneratorContract
  usernameGenerator: UsernameGeneratorServiceContract
  authSessionService: AuthSessionServiceContract
}

export type AuthUserMapperInput = Parameters<
  AuthUserMapperContract['toAuthUser']
>[0]

export type AuthComposition = {
  useCases: AuthUseCases
  helpers: AuthServiceHelpers
}

export const createAuthComposition = (): AuthComposition => {
  const authRepository = mongoAuthRepository

  const authUserMapper = new AuthUserMapper()
  const authSessionMapper = new AuthSessionMapper()
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

  return {
    useCases: {
      registerUser: new RegisterUserUseCase(
        authRepository,
        authNotificationService,
        identifierNormalizer,
        usernameGenerator,
        passwordHasher,
        authUserMapper
      ),

      loginUser: new LoginUserUseCase(
        authRepository,
        authNotificationService,
        authRedirectService,
        identifierNormalizer,
        authAccountPolicy,
        authSessionService,
        authTokenService,
        passwordHasher,
        securityAttemptStore,
        authUserMapper
      ),

      handleOAuthLogin: new HandleOAuthLoginUseCase(
        authRepository,
        authRedirectService,
        authTokenService,
        authAccountPolicy,
        authSessionService,
        authUserMapper
      ),

      verifyTwoFactorLogin: new VerifyTwoFactorLoginUseCase(
        authRepository,
        authRedirectService,
        authTokenService,
        authAccountPolicy,
        authSessionService,
        securityAttemptStore,
        twoFactorCodeVerifier,
        backupCodeNormalizer,
        passwordHasher,
        authUserMapper
      ),

      logoutUser: new LogoutUserUseCase(authRepository),

      logoutAllSessions: new LogoutAllSessionsUseCase(authRepository),

      refreshAuthTokens: new RefreshAuthTokensUseCase(
        authRepository,
        authTokenService,
        retiredRefreshTokenStore,
        securityAuditLoggerService,
        authAccountPolicy
      ),

      getCurrentUser: new GetCurrentUserUseCase(
        authRepository,
        authAccountPolicy,
        authUserMapper
      ),

      verifyAccount: new VerifyAccountUseCase(
        authRepository,
        identifierNormalizer,
        securityAttemptStore,
        phoneOtpProvider,
        phoneOtpSessionStore,
        otpStore
      ),

      resendOtp: new ResendOtpUseCase(
        authRepository,
        authNotificationService,
        identifierNormalizer
      ),

      forgotPassword: new ForgotPasswordUseCase(
        authRepository,
        authNotificationService,
        identifierNormalizer
      ),

      verifyResetCode: new VerifyResetCodeUseCase(
        authRepository,
        identifierNormalizer,
        securityAttemptStore,
        phoneOtpProvider,
        phoneOtpSessionStore,
        passwordResetTokenService,
        otpStore
      ),

      resetPassword: new ResetPasswordUseCase(
        authRepository,
        passwordResetTokenService,
        passwordResetSessionStore,
        securityAuditLoggerService,
        passwordHasher
      ),

      changePassword: new ChangePasswordUseCase(
        authRepository,
        passwordHasher
      ),

      checkIdentifier: new CheckIdentifierUseCase(
        authRepository,
        identifierNormalizer
      ),

      checkUsername: new CheckUsernameUseCase(authRepository),

      getAuthSessions: new GetAuthSessionsUseCase(
        authRepository,
        authSessionMapper,
      ),

      revokeAuthSession: new RevokeAuthSessionUseCase(authRepository),
    },

    helpers: {
      authUserMapper,
      authTokenService,
      otpGenerator,
      usernameGenerator,
      authSessionService,
    },
  }
}
