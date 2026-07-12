import { AuthUserMapper, type IAuthUserMapper } from './application/mappers/auth-user.mapper'
import { systemClock } from '../../infrastructure/time/system-clock'
import { AuthSessionMapper } from './application/mappers/auth-session.mapper'
import { AuthAccountPolicy } from './application/policies/auth-account-policy.policy'
import { AuthNotificationCoordinator } from './application/services/auth-notification.service'
import { AuthRedirectResolver } from './application/services/auth-redirect.service'
import { AuthSessionIssuer, type IAuthSessionIssuer } from './application/services/auth-session.service'
import { BackupCodeNormalizer } from './application/services/backup-code-normalizer.service'
import { IdentifierNormalizer } from './application/services/identifier-normalizer.service'
import { UsernameGenerator, type IUsernameGenerator } from './application/services/username-generator.service'

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

import type { IAuthToken } from './domain/services/auth-token.interface'
import type { IOtpGenerator } from './domain/services/otp-generator.interface'

import { mongoAuthRepository } from './infrastructure/repositories/mongo-auth.repository'
import { bcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher.service'
import { cryptoOtpGenerator } from './infrastructure/services/crypto-otp-generator.service'
import { cryptoRandomNumberGenerator } from './infrastructure/services/crypto-random-number-generator.service'
import { jwtAuthToken } from './infrastructure/services/jwt-auth-token.service'
import { jwtPasswordResetToken } from './infrastructure/services/jwt-password-reset-token.service'
import { jwtModerationAppealToken } from './infrastructure/services/jwt-moderation-appeal-token.service'
import { otplibTwoFactorCodeVerifier } from './infrastructure/services/otplib-two-factor-code-verifier.service'
import { securityAuditLogger } from './infrastructure/loggers/security-audit.logger'
import { messageCentralPhoneOtpProvider } from './infrastructure/providers/message-central-phone-otp.provider'
import { nodemailerOtpEmailProvider } from './infrastructure/providers/nodemailer-otp-email.provider'
import { redisOtpStore } from './infrastructure/stores/redis-otp.store'
import { redisPendingRegistrationStore } from './infrastructure/stores/redis-pending-registration.store'
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
  authUserMapper: IAuthUserMapper
  authToken: IAuthToken
  otpGenerator: IOtpGenerator
  usernameGenerator: IUsernameGenerator
  authSessionIssuer: IAuthSessionIssuer
}

export type AuthUserMapperInput = Parameters<
  IAuthUserMapper['toAuthUser']
>[0]

export type AuthComposition = {
  useCases: AuthUseCases
  helpers: AuthServiceHelpers
}

export const createAuthComposition = (): AuthComposition => {
  const authRepository = mongoAuthRepository

  const authUserMapper = new AuthUserMapper()
  const authSessionMapper = new AuthSessionMapper()
  const identifierNormalizer = new IdentifierNormalizer()
  const otpGenerator = cryptoOtpGenerator

  const usernameGenerator = new UsernameGenerator(
    authRepository,
    cryptoRandomNumberGenerator
  )

  const authAccountPolicy = new AuthAccountPolicy(systemClock)
  const backupCodeNormalizer = new BackupCodeNormalizer()

  const passwordHasher = bcryptPasswordHasher
  const authToken = jwtAuthToken
  const passwordResetSessionStore = redisPasswordResetSessionStore
  const passwordResetToken = jwtPasswordResetToken
  const securityAttemptStore = redisSecurityAttemptStore
  const phoneOtpSessionStore = redisPhoneOtpSessionStore
  const phoneOtpProvider = messageCentralPhoneOtpProvider
  const retiredRefreshTokenStore = redisRetiredRefreshTokenStore
  const otpStore = redisOtpStore
  const pendingRegistrationStore = redisPendingRegistrationStore
  const auditLogger = securityAuditLogger
  const twoFactorCodeVerifier = otplibTwoFactorCodeVerifier

  const authRedirectResolver = new AuthRedirectResolver()

  const authNotification = new AuthNotificationCoordinator(
    otpStore,
    otpGenerator,
    identifierNormalizer,
    phoneOtpProvider,
    phoneOtpSessionStore,
    nodemailerOtpEmailProvider
  )

  const authSessionIssuer = new AuthSessionIssuer(
    authRepository,
    authToken
  )

  return {
    useCases: {
      registerUser: new RegisterUserUseCase(
        authRepository,
        authNotification,
        identifierNormalizer,
        passwordHasher,
        pendingRegistrationStore
      ),

      loginUser: new LoginUserUseCase(
        authRepository,
        authNotification,
        authRedirectResolver,
        identifierNormalizer,
        authAccountPolicy,
        authSessionIssuer,
        authToken,
        passwordHasher,
        securityAttemptStore,
        authUserMapper,
        jwtModerationAppealToken,
      ),

      handleOAuthLogin: new HandleOAuthLoginUseCase(
        authRepository,
        authRedirectResolver,
        authToken,
        authAccountPolicy,
        authSessionIssuer,
        authUserMapper
      ),

      verifyTwoFactorLogin: new VerifyTwoFactorLoginUseCase(
        authRepository,
        authRedirectResolver,
        authToken,
        authAccountPolicy,
        authSessionIssuer,
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
        authToken,
        retiredRefreshTokenStore,
        auditLogger,
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
        otpStore,
        pendingRegistrationStore,
        usernameGenerator
      ),

      resendOtp: new ResendOtpUseCase(
        authRepository,
        authNotification,
        identifierNormalizer,
        pendingRegistrationStore
      ),

      forgotPassword: new ForgotPasswordUseCase(
        authRepository,
        authNotification,
        identifierNormalizer
      ),

      verifyResetCode: new VerifyResetCodeUseCase(
        authRepository,
        identifierNormalizer,
        securityAttemptStore,
        phoneOtpProvider,
        phoneOtpSessionStore,
        passwordResetToken,
        otpStore
      ),

      resetPassword: new ResetPasswordUseCase(
        authRepository,
        passwordResetToken,
        passwordResetSessionStore,
        auditLogger,
        passwordHasher
      ),

      changePassword: new ChangePasswordUseCase(
        authRepository,
        passwordHasher
      ),

      checkIdentifier: new CheckIdentifierUseCase(
        authRepository,
        identifierNormalizer,
        pendingRegistrationStore
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
      authToken,
      otpGenerator,
      usernameGenerator,
      authSessionIssuer,
    },
  }
}
