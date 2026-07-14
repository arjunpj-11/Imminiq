export * from './auth-runtime-policy';

export * from './entities/auth-session.entity';
export * from './entities/auth-user.entity';
export * from './entities/two-factor-auth.entity';

export * from './auth-domain.error';

export type { IAuthRepository } from './repositories/auth.repository.interface';
export type { IAuthSessionRepository } from './repositories/auth-session.repository.interface';
export type { IAuthTwoFactorRepository } from './repositories/auth-two-factor.repository.interface';
export type { IAuthUserRepository } from './repositories/auth-user.repository.interface';

export type { IAuthNotification } from './services/auth-notification.interface';
export type { IAuthRedirectResolver } from './services/auth-redirect.interface';
export type { IAuthToken } from './services/auth-token.interface';
export type { IIdentifierNormalizer } from './services/identifier-normalizer.interface';
export type { IOtpEmailProvider } from './services/otp-email-provider.interface';
export type { IOtpGenerator } from './services/otp-generator.interface';
export type { IOtpStore } from './services/otp-store.interface';
export type { IPasswordHasher } from './services/password-hasher.interface';
export type { IPasswordResetSessionStore } from './services/password-reset-session-store.interface';
export type { IPasswordResetToken } from './services/password-reset-token.interface';
export type {
  IPendingRegistrationStore,
  PendingRegistration,
} from './services/pending-registration-store.interface';
export type { IPhoneOtpProvider } from './services/phone-otp-provider.interface';
export type { IPhoneOtpSessionStore } from './services/phone-otp-session-store.interface';
export type { IRandomNumberGenerator } from './services/random-number-generator.interface';
export type { IRetiredRefreshTokenStore } from './services/retired-refresh-token-store.interface';
export type { ISecurityAttemptStore } from './services/security-attempt-store.interface';
export type { ISecurityAuditLogger } from './services/security-audit-logger.interface';
export type { ITwoFactorCodeVerifier } from './services/two-factor-code-verifier.interface';

export * from './auth.types';
export type { AuthRole } from './value-objects/auth-role.vo';
export type { LoginRedirectPath } from './value-objects/login-redirect-path.vo';
export type { OAuthProvider } from './value-objects/oauth-provider.vo';
export type { OtpPurpose } from './value-objects/otp-purpose.vo';
export type { ParsedIdentifier } from './value-objects/parsed-identifier.vo';
export type {
  IJwtPayload,
  ResetTokenPayload,
  TwoFactorChallengeTokenPayload,
} from './value-objects/token-payload.vo';
export type { TwoFactorStatus } from './value-objects/two-factor-status.vo';
export type { UserStatus } from './value-objects/user-status.vo';
export type { VerificationMethod } from './value-objects/verification-method.vo';
