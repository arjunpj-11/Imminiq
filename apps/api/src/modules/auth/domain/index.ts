export * from './constants/auth.constants'

export * from './entities/auth-session.entity'
export * from './entities/auth-user.entity'
export * from './entities/two-factor-auth.entity'

export * from './errors/auth-domain.error'

export type { AuthRepositoryContract } from './repositories/auth.repository.interface'
export type { AuthSessionRepositoryContract } from './repositories/auth-session.repository.interface'
export type { AuthTwoFactorRepositoryContract } from './repositories/auth-two-factor.repository.interface'
export type { AuthUserRepositoryContract } from './repositories/auth-user.repository.interface'

export type { AuthNotificationServiceContract } from './services/auth-notification.service.interface'
export type { AuthRedirectServiceContract } from './services/auth-redirect.service.interface'
export type { AuthTokenServiceContract } from './services/auth-token.service.interface'
export type { IdentifierNormalizerContract } from './services/identifier-normalizer.service.interface'
export type { OtpEmailProviderContract } from './services/otp-email-provider.interface'
export type { OtpGeneratorContract } from './services/otp-generator.service.interface'
export type { OtpStoreContract } from './services/otp-store.interface'
export type { PasswordHasherServiceContract } from './services/password-hasher.service.interface'
export type { PasswordResetSessionStoreContract } from './services/password-reset-session-store.interface'
export type { PasswordResetTokenServiceContract } from './services/password-reset-token.service.interface'
export type { PhoneOtpProviderContract } from './services/phone-otp-provider.interface'
export type { PhoneOtpSessionStoreContract } from './services/phone-otp-session-store.interface'
export type { RandomNumberGeneratorContract } from './services/random-number-generator.service.interface'
export type { RetiredRefreshTokenStoreContract } from './services/retired-refresh-token-store.interface'
export type { SecurityAttemptStoreContract } from './services/security-attempt-store.interface'
export type { SecurityAuditLoggerContract } from './services/security-audit-logger.interface'
export type { TwoFactorCodeVerifierContract } from './services/two-factor-code-verifier.interface'

export * from './types/auth.types'
export type { AuthRole } from './value-objects/auth-role.vo'
export type { LoginRedirectPath } from './value-objects/login-redirect-path.vo'
export type { OAuthProvider } from './value-objects/oauth-provider.vo'
export type { OtpPurpose } from './value-objects/otp-purpose.vo'
export type { ParsedIdentifier } from './value-objects/parsed-identifier.vo'
export type {
  JwtPayload,
  ResetTokenPayload,
  TwoFactorChallengeTokenPayload,
} from './value-objects/token-payload.vo'
export type { TwoFactorStatus } from './value-objects/two-factor-status.vo'
export type { UserStatus } from './value-objects/user-status.vo'
export type { VerificationMethod } from './value-objects/verification-method.vo'
