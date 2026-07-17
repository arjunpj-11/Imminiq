import type { ErrorKind } from '../../../shared/errors/error-kind';
import { SecurityDomainError } from '../domain/security-domain.error';

export type SecurityApplicationErrorCode =
  | 'ACCOUNT_DELETE_FAILED'
  | 'CANNOT_REVOKE_CURRENT_SESSION'
  | 'EMAIL_CHANGE_LINK_INVALID'
  | 'EMAIL_CHANGE_REQUEST_FAILED'
  | 'EMAIL_CHANGE_VERIFY_FAILED'
  | 'EMAIL_REQUIRED'
  | 'EMAIL_TAKEN'
  | 'EMAIL_UNCHANGED'
  | 'INVALID_DELETE_CONFIRMATION'
  | 'INVALID_TWO_FACTOR_CODE'
  | 'NOT_FOUND'
  | 'PASSWORD_CHANGE_FAILED'
  | 'PASSWORD_UNAVAILABLE'
  | 'SESSION_NOT_FOUND'
  | 'STEP_UP_PASSWORD_INVALID'
  | 'STEP_UP_PASSWORD_REQUIRED'
  | 'STEP_UP_PASSWORD_UNAVAILABLE'
  | 'STEP_UP_REQUIRES_TWO_FACTOR_FOR_SOCIAL_ACCOUNT'
  | 'STEP_UP_TWO_FACTOR_INVALID'
  | 'STEP_UP_TWO_FACTOR_REQUIRED'
  | 'TWO_FACTOR_ALREADY_ENABLED'
  | 'TWO_FACTOR_DISABLE_FAILED'
  | 'TWO_FACTOR_DISABLE_TEMPORARILY_BLOCKED'
  | 'TWO_FACTOR_ENABLE_FAILED'
  | 'TWO_FACTOR_NOT_ENABLED'
  | 'TWO_FACTOR_SECRET_MISSING'
  | 'TWO_FACTOR_SETUP_FAILED'
  | 'TWO_FACTOR_SETUP_NOT_FOUND'
  | 'TWO_FACTOR_SETUP_NOT_PENDING'
  | 'TWO_FACTOR_SETUP_TEMPORARILY_BLOCKED'
  | 'WRONG_PASSWORD';

export class SecurityApplicationError extends SecurityDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: SecurityApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'SecurityApplicationError';
    this.kind = kind;
  }

  static accountDeleteFailed(): SecurityApplicationError {
    return new SecurityApplicationError(
      'internal',
      'ACCOUNT_DELETE_FAILED',
      'Failed to schedule account deletion'
    );
  }

  static cannotRevokeCurrentSession(): SecurityApplicationError {
    return new SecurityApplicationError(
      'forbidden',
      'CANNOT_REVOKE_CURRENT_SESSION',
      'Use logout to end your current session'
    );
  }

  static emailChangeLinkInvalid(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'EMAIL_CHANGE_LINK_INVALID',
      'This email verification link is invalid or expired'
    );
  }

  static emailChangeRequestFailed(): SecurityApplicationError {
    return new SecurityApplicationError(
      'internal',
      'EMAIL_CHANGE_REQUEST_FAILED',
      'Failed to create email change request'
    );
  }

  static emailChangeVerifyFailed(): SecurityApplicationError {
    return new SecurityApplicationError(
      'internal',
      'EMAIL_CHANGE_VERIFY_FAILED',
      'Failed to verify email change'
    );
  }

  static emailRequired(): SecurityApplicationError {
    return new SecurityApplicationError('invalid-input', 'EMAIL_REQUIRED', 'New email is required');
  }

  static emailTaken(message = 'Email is already in use'): SecurityApplicationError {
    return new SecurityApplicationError('conflict', 'EMAIL_TAKEN', message);
  }

  static emailUnchanged(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'EMAIL_UNCHANGED',
      'New email must be different from current email'
    );
  }

  static invalidDeleteConfirmation(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'INVALID_DELETE_CONFIRMATION',
      'Type DELETE to confirm account deletion'
    );
  }

  static invalidTwoFactorCode(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'INVALID_TWO_FACTOR_CODE',
      'Invalid authenticator code'
    );
  }

  static notFound(message = 'User not found'): SecurityApplicationError {
    return new SecurityApplicationError('missing-resource', 'NOT_FOUND', message);
  }

  static passwordChangeFailed(): SecurityApplicationError {
    return new SecurityApplicationError('internal', 'PASSWORD_CHANGE_FAILED', 'Unable to change password');
  }

  static passwordUnavailable(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'PASSWORD_UNAVAILABLE',
      'Password changes are unavailable for this account'
    );
  }

  static sessionNotFound(): SecurityApplicationError {
    return new SecurityApplicationError('missing-resource', 'SESSION_NOT_FOUND', 'Session not found');
  }

  static stepUpPasswordInvalid(): SecurityApplicationError {
    return new SecurityApplicationError(
      'unauthenticated',
      'STEP_UP_PASSWORD_INVALID',
      'Current password is incorrect'
    );
  }

  static stepUpPasswordRequired(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'STEP_UP_PASSWORD_REQUIRED',
      'Current password is required for this security action'
    );
  }

  static stepUpPasswordUnavailable(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'STEP_UP_PASSWORD_UNAVAILABLE',
      'Password reauthentication is unavailable for this account'
    );
  }

  static stepUpRequiresTwoFactorForSocialAccount(): SecurityApplicationError {
    return new SecurityApplicationError(
      'forbidden',
      'STEP_UP_REQUIRES_TWO_FACTOR_FOR_SOCIAL_ACCOUNT',
      'Enable two-factor authentication before performing this security action.'
    );
  }

  static stepUpTwoFactorInvalid(): SecurityApplicationError {
    return new SecurityApplicationError(
      'unauthenticated',
      'STEP_UP_TWO_FACTOR_INVALID',
      'Invalid two-factor code'
    );
  }

  static stepUpTwoFactorRequired(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'STEP_UP_TWO_FACTOR_REQUIRED',
      'Two-factor code is required for this security action'
    );
  }

  static twoFactorAlreadyEnabled(): SecurityApplicationError {
    return new SecurityApplicationError(
      'conflict',
      'TWO_FACTOR_ALREADY_ENABLED',
      'Two-factor authentication is already enabled'
    );
  }

  static twoFactorDisableFailed(): SecurityApplicationError {
    return new SecurityApplicationError(
      'internal',
      'TWO_FACTOR_DISABLE_FAILED',
      'Unable to disable two-factor authentication'
    );
  }

  static twoFactorDisableTemporarilyBlocked(): SecurityApplicationError {
    return new SecurityApplicationError(
      'rate-limited',
      'TWO_FACTOR_DISABLE_TEMPORARILY_BLOCKED',
      'Too many invalid authenticator codes. Please try again later.'
    );
  }

  static twoFactorEnableFailed(): SecurityApplicationError {
    return new SecurityApplicationError(
      'internal',
      'TWO_FACTOR_ENABLE_FAILED',
      'Unable to enable two-factor authentication'
    );
  }

  static twoFactorNotEnabled(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'TWO_FACTOR_NOT_ENABLED',
      'Two-factor authentication is not enabled'
    );
  }

  static twoFactorSecretMissing(): SecurityApplicationError {
    return new SecurityApplicationError(
      'internal',
      'TWO_FACTOR_SECRET_MISSING',
      'Two-factor secret is missing'
    );
  }

  static twoFactorSetupFailed(): SecurityApplicationError {
    return new SecurityApplicationError(
      'internal',
      'TWO_FACTOR_SETUP_FAILED',
      'Unable to start two-factor setup'
    );
  }

  static twoFactorSetupNotFound(): SecurityApplicationError {
    return new SecurityApplicationError(
      'missing-resource',
      'TWO_FACTOR_SETUP_NOT_FOUND',
      'Two-factor setup was not found'
    );
  }

  static twoFactorSetupNotPending(): SecurityApplicationError {
    return new SecurityApplicationError(
      'invalid-input',
      'TWO_FACTOR_SETUP_NOT_PENDING',
      'Start two-factor setup again before verifying'
    );
  }

  static twoFactorSetupTemporarilyBlocked(): SecurityApplicationError {
    return new SecurityApplicationError(
      'rate-limited',
      'TWO_FACTOR_SETUP_TEMPORARILY_BLOCKED',
      'Too many invalid authenticator codes. Start setup again or try later.'
    );
  }

  static wrongPassword(): SecurityApplicationError {
    return new SecurityApplicationError('invalid-input', 'WRONG_PASSWORD', 'Current password is incorrect');
  }
}

export const isSecurityApplicationError = (error: unknown): error is SecurityApplicationError =>
  error instanceof SecurityApplicationError;
