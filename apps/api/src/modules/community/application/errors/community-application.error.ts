import { CommunityDomainError } from '../../domain/errors/community-domain.error'

export type CommunityApplicationErrorCode =
  | 'COMMUNITY_BAD_REQUEST'
  | 'COMMUNITY_FORBIDDEN'
  | 'COMMUNITY_NOT_FOUND'
  | 'COMMUNITY_CONFLICT'
  | 'COMMUNITY_VALIDATION_ERROR'

export class CommunityApplicationError extends CommunityDomainError {
  readonly statusCode: number

  private constructor(
    statusCode: number,
    code: CommunityApplicationErrorCode,
    message: string,
  ) {
    super(code, message)
    this.name = 'CommunityApplicationError'
    this.statusCode = statusCode
  }

  static badRequest(message = 'Bad request'): CommunityApplicationError {
    return new CommunityApplicationError(400, 'COMMUNITY_BAD_REQUEST', message)
  }

  static forbidden(message = 'Forbidden'): CommunityApplicationError {
    return new CommunityApplicationError(403, 'COMMUNITY_FORBIDDEN', message)
  }

  static notFound(message = 'Not found'): CommunityApplicationError {
    return new CommunityApplicationError(404, 'COMMUNITY_NOT_FOUND', message)
  }

  static conflict(message = 'Conflict'): CommunityApplicationError {
    return new CommunityApplicationError(409, 'COMMUNITY_CONFLICT', message)
  }

  static validation(message = 'Validation failed'): CommunityApplicationError {
    return new CommunityApplicationError(422, 'COMMUNITY_VALIDATION_ERROR', message)
  }
}

export const isCommunityApplicationError = (
  error: unknown,
): error is CommunityApplicationError => {
  return error instanceof CommunityApplicationError
}
