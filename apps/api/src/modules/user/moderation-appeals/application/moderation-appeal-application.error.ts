import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { ModerationAppealDomainError } from '../domain/moderation-appeal-domain.error';

export type ModerationAppealApplicationErrorCode =
  | 'ACTIVE_APPEAL_ALREADY_EXISTS'
  | 'APPEAL_CASE_ID_GENERATION_FAILED'
  | 'RESTRICTED_ACCOUNT_NOT_FOUND'
  | 'APPEAL_AUTHORIZATION_MISMATCH';

export class ModerationAppealApplicationError extends ModerationAppealDomainError {
  readonly kind: ErrorKind;

  private constructor(
    kind: ErrorKind,
    code: ModerationAppealApplicationErrorCode,
    message: string
  ) {
    super(code, message);
    this.kind = kind;
    this.name = 'ModerationAppealApplicationError';
  }

  static activeAppealAlreadyExists(): ModerationAppealApplicationError {
    return new ModerationAppealApplicationError(
      'conflict',
      'ACTIVE_APPEAL_ALREADY_EXISTS',
      'An appeal is already under review for this account.'
    );
  }

  static appealCaseIdGenerationFailed(): ModerationAppealApplicationError {
    return new ModerationAppealApplicationError(
      'internal',
      'APPEAL_CASE_ID_GENERATION_FAILED',
      'Unable to generate an appeal case ID. Please try again.'
    );
  }

  static restrictedAccountNotFound(): ModerationAppealApplicationError {
    return new ModerationAppealApplicationError(
      'missing-resource',
      'RESTRICTED_ACCOUNT_NOT_FOUND',
      'No restricted account was found for this email or phone number.'
    );
  }

  static authorizationMismatch(): ModerationAppealApplicationError {
    return new ModerationAppealApplicationError(
      'forbidden',
      'APPEAL_AUTHORIZATION_MISMATCH',
      'Appeal authorization does not match this account. Please sign in again.'
    );
  }
}

export const isModerationAppealApplicationError = (
  error: unknown
): error is ModerationAppealApplicationError => error instanceof ModerationAppealApplicationError;
