import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { CommunityDomainError } from '../domain/community-domain.error';

export type CommunityApplicationErrorCode =
  | 'COMMUNITY_BAD_REQUEST'
  | 'COMMUNITY_FORBIDDEN'
  | 'COMMUNITY_NOT_FOUND'
  | 'COMMUNITY_CONFLICT'
  | 'COMMUNITY_VALIDATION_ERROR';

export class CommunityApplicationError extends CommunityDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: CommunityApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'CommunityApplicationError';
    this.kind = kind;
  }

  static badRequest(message = 'Bad request'): CommunityApplicationError {
    return new CommunityApplicationError('invalid-input', 'COMMUNITY_BAD_REQUEST', message);
  }

  static forbidden(message = 'Forbidden'): CommunityApplicationError {
    return new CommunityApplicationError('forbidden', 'COMMUNITY_FORBIDDEN', message);
  }

  static notFound(message = 'Not found'): CommunityApplicationError {
    return new CommunityApplicationError('missing-resource', 'COMMUNITY_NOT_FOUND', message);
  }

  static conflict(message = 'Conflict'): CommunityApplicationError {
    return new CommunityApplicationError('conflict', 'COMMUNITY_CONFLICT', message);
  }

  static validation(message = 'Validation failed'): CommunityApplicationError {
    return new CommunityApplicationError('invalid-input', 'COMMUNITY_VALIDATION_ERROR', message);
  }
}

export const isCommunityApplicationError = (error: unknown): error is CommunityApplicationError => {
  return error instanceof CommunityApplicationError;
};
