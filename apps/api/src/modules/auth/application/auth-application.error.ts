import { AuthDomainError } from '../domain/auth-domain.error'

export type AuthApplicationErrorCode =
  | 'ACCOUNT_BLOCKED'
  | 'ACCOUNT_BANNED'
  | 'ACCOUNT_DEACTIVATED'
  | 'ACCOUNT_PAUSED'
  | 'EMAIL_ALREADY_VERIFIED'
  | 'EMAIL_NOT_VERIFIED'
  | 'EMAIL_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_OTP'
  | 'INVALID_OTP_PURPOSE'
  | 'INVALID_REFRESH_COOKIE'
  | 'INVALID_RESET_TOKEN'
  | 'INVALID_TWO_FACTOR_CHALLENGE'
  | 'INVALID_TWO_FACTOR_LOGIN_CODE'
  | 'LOGIN_TEMPORARILY_BLOCKED'
  | 'NO_REFRESH_TOKEN'
  | 'NOT_FOUND'
  | 'OAUTH_ACCOUNT'
  | 'OAUTH_FAILED'
  | 'OAUTH_USER_MISSING'
  | 'OTP_SEND_FAILED'
  | 'OTP_SESSION_EXPIRED'
  | 'OTP_VERIFICATION_TEMPORARILY_BLOCKED'
  | 'PHONE_ALREADY_VERIFIED'
  | 'PHONE_NOT_VERIFIED'
  | 'PHONE_TAKEN'
  | 'REFRESH_TOKEN_REUSE_DETECTED'
  | 'RESET_CODE_VERIFICATION_TEMPORARILY_BLOCKED'
  | 'SESSION_ID_REQUIRED'
  | 'SESSION_REFRESH_FAILED'
  | 'TWO_FACTOR_CHALLENGE_EXPIRED'
  | 'TWO_FACTOR_CHALLENGE_INVALID'
  | 'TWO_FACTOR_CHALLENGE_MISSING'
  | 'TWO_FACTOR_LOGIN_TEMPORARILY_BLOCKED'
  | 'TWO_FACTOR_NOT_ACTIVE'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'USERNAME_GENERATION_FAILED'
  | 'USERNAME_TAKEN'
  | 'WRONG_PASSWORD'

export class AuthApplicationError extends AuthDomainError {
  readonly statusCode: number
  data?: Record<string, unknown>

  private constructor(
    statusCode: number,
    code: AuthApplicationErrorCode,
    message: string
  ) {
    super(code, message)
    this.name = 'AuthApplicationError'
    this.statusCode = statusCode
  }

  withData(data: Record<string, unknown>): this {
    this.data = data
    return this
  }

  static accountBlocked(message = 'Account blocked'): AuthApplicationError {
    return new AuthApplicationError(403, 'ACCOUNT_BLOCKED', message)
  }

  static accountBanned(message = 'Account banned'): AuthApplicationError {
    return new AuthApplicationError(403, 'ACCOUNT_BANNED', message)
  }

  static accountDeactivated(message = 'Account deactivated'): AuthApplicationError {
    return new AuthApplicationError(403, 'ACCOUNT_DEACTIVATED', message)
  }

  static accountPaused(message = 'Account paused'): AuthApplicationError {
    return new AuthApplicationError(403, 'ACCOUNT_PAUSED', message)
  }

  static emailAlreadyVerified(message = 'Email is already verified'): AuthApplicationError {
    return new AuthApplicationError(400, 'EMAIL_ALREADY_VERIFIED', message)
  }

  static emailNotVerified(message = 'Please verify your email before signing in.'): AuthApplicationError {
    return new AuthApplicationError(403, 'EMAIL_NOT_VERIFIED', message)
  }

  static emailTaken(message = 'Email already in use'): AuthApplicationError {
    return new AuthApplicationError(409, 'EMAIL_TAKEN', message)
  }

  static invalidCredentials(message = 'Invalid credentials'): AuthApplicationError {
    return new AuthApplicationError(401, 'INVALID_CREDENTIALS', message)
  }

  static invalidOtp(message = 'Invalid or expired OTP'): AuthApplicationError {
    return new AuthApplicationError(400, 'INVALID_OTP', message)
  }

  static invalidOtpPurpose(message = 'Invalid OTP purpose'): AuthApplicationError {
    return new AuthApplicationError(400, 'INVALID_OTP_PURPOSE', message)
  }

  static invalidRefreshCookie(message = 'Refresh token cookie is invalid'): AuthApplicationError {
    return new AuthApplicationError(401, 'INVALID_REFRESH_COOKIE', message)
  }

  static invalidResetToken(message = 'Invalid or expired reset token'): AuthApplicationError {
    return new AuthApplicationError(400, 'INVALID_RESET_TOKEN', message)
  }

  static invalidTwoFactorChallenge(message = 'Invalid two-factor challenge'): AuthApplicationError {
    return new AuthApplicationError(401, 'INVALID_TWO_FACTOR_CHALLENGE', message)
  }

  static invalidTwoFactorLoginCode(message = 'Invalid two-factor code'): AuthApplicationError {
    return new AuthApplicationError(400, 'INVALID_TWO_FACTOR_LOGIN_CODE', message)
  }

  static loginTemporarilyBlocked(message = 'Too many failed login attempts. Please try again later.'): AuthApplicationError {
    return new AuthApplicationError(429, 'LOGIN_TEMPORARILY_BLOCKED', message)
  }

  static noRefreshToken(message = 'No refresh token'): AuthApplicationError {
    return new AuthApplicationError(401, 'NO_REFRESH_TOKEN', message)
  }

  static notFound(message = 'Not found'): AuthApplicationError {
    return new AuthApplicationError(404, 'NOT_FOUND', message)
  }

  static oauthAccount(message = 'This account uses social login'): AuthApplicationError {
    return new AuthApplicationError(400, 'OAUTH_ACCOUNT', message)
  }

  static oauthFailed(message = 'OAuth authentication failed'): AuthApplicationError {
    return new AuthApplicationError(401, 'OAUTH_FAILED', message)
  }

  static oauthUserMissing(message = 'OAuth user is missing'): AuthApplicationError {
    return new AuthApplicationError(401, 'OAUTH_USER_MISSING', message)
  }

  static otpSendFailed(message = 'Could not send OTP. Please try again.'): AuthApplicationError {
    return new AuthApplicationError(503, 'OTP_SEND_FAILED', message)
  }

  static otpSessionExpired(message = 'OTP session expired. Please request a new OTP.'): AuthApplicationError {
    return new AuthApplicationError(400, 'OTP_SESSION_EXPIRED', message)
  }

  static otpVerificationTemporarilyBlocked(message = 'Too many invalid verification attempts. Request a new OTP or try again later.'): AuthApplicationError {
    return new AuthApplicationError(429, 'OTP_VERIFICATION_TEMPORARILY_BLOCKED', message)
  }

  static phoneAlreadyVerified(message = 'Phone is already verified'): AuthApplicationError {
    return new AuthApplicationError(400, 'PHONE_ALREADY_VERIFIED', message)
  }

  static phoneNotVerified(message = 'Please verify your phone before signing in.'): AuthApplicationError {
    return new AuthApplicationError(403, 'PHONE_NOT_VERIFIED', message)
  }

  static phoneTaken(message = 'Phone already in use'): AuthApplicationError {
    return new AuthApplicationError(409, 'PHONE_TAKEN', message)
  }

  static refreshTokenReuseDetected(message = 'Refresh token reuse detected. Please sign in again.'): AuthApplicationError {
    return new AuthApplicationError(401, 'REFRESH_TOKEN_REUSE_DETECTED', message)
  }

  static resetCodeVerificationTemporarilyBlocked(message = 'Too many invalid reset-code attempts. Request a new code or try again later.'): AuthApplicationError {
    return new AuthApplicationError(429, 'RESET_CODE_VERIFICATION_TEMPORARILY_BLOCKED', message)
  }

  static sessionIdRequired(message = 'Session ID is required'): AuthApplicationError {
    return new AuthApplicationError(400, 'SESSION_ID_REQUIRED', message)
  }

  static sessionRefreshFailed(message = 'Unable to refresh session'): AuthApplicationError {
    return new AuthApplicationError(401, 'SESSION_REFRESH_FAILED', message)
  }

  static twoFactorChallengeExpired(message = 'Two-factor challenge expired. Please sign in again.'): AuthApplicationError {
    return new AuthApplicationError(401, 'TWO_FACTOR_CHALLENGE_EXPIRED', message)
  }

  static twoFactorChallengeInvalid(message = 'Two-factor challenge is invalid. Please sign in again.'): AuthApplicationError {
    return new AuthApplicationError(401, 'TWO_FACTOR_CHALLENGE_INVALID', message)
  }

  static twoFactorChallengeMissing(message = 'Two-factor challenge is missing. Please sign in again.'): AuthApplicationError {
    return new AuthApplicationError(401, 'TWO_FACTOR_CHALLENGE_MISSING', message)
  }

  static twoFactorLoginTemporarilyBlocked(message = 'Too many invalid two-factor attempts. Please sign in again later.'): AuthApplicationError {
    return new AuthApplicationError(429, 'TWO_FACTOR_LOGIN_TEMPORARILY_BLOCKED', message)
  }

  static twoFactorNotActive(message = 'Two-factor authentication is no longer active. Please sign in again.'): AuthApplicationError {
    return new AuthApplicationError(401, 'TWO_FACTOR_NOT_ACTIVE', message)
  }

  static unauthorized(message = 'Unauthorized'): AuthApplicationError {
    return new AuthApplicationError(401, 'UNAUTHORIZED', message)
  }

  static validationError(message = 'Validation error'): AuthApplicationError {
    return new AuthApplicationError(400, 'VALIDATION_ERROR', message)
  }

  static usernameGenerationFailed(message = 'Could not generate a unique username. Please try again.'): AuthApplicationError {
    return new AuthApplicationError(500, 'USERNAME_GENERATION_FAILED', message)
  }

  static usernameTaken(message = 'Username already in use'): AuthApplicationError {
    return new AuthApplicationError(409, 'USERNAME_TAKEN', message)
  }

  static wrongPassword(message = 'Current password is incorrect'): AuthApplicationError {
    return new AuthApplicationError(400, 'WRONG_PASSWORD', message)
  }
}

export const isAuthApplicationError = (
  error: unknown
): error is AuthApplicationError => {
  return error instanceof AuthApplicationError
}
