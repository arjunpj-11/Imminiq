import { AuthDomainError } from '../../domain/errors/auth-domain.error'
import type { MongoDuplicateKeyError } from './mongo-auth.types'

export type ErrorMapper = (error: unknown) => AuthDomainError | null

export class MongoAuthErrorMapper {
  static mapDuplicateUserError(error: unknown): AuthDomainError | null {
    if (!this.isMongoDuplicateKeyError(error)) {
      return null
    }

    const duplicateKeys = {
      ...error.keyPattern,
      ...error.keyValue,
    }

    if ('email' in duplicateKeys) {
      return new AuthDomainError('EMAIL_TAKEN', 'Email already in use')
    }

    if ('phone' in duplicateKeys) {
      return new AuthDomainError('PHONE_TAKEN', 'Phone already in use')
    }

    if ('username' in duplicateKeys) {
      return new AuthDomainError('USERNAME_TAKEN', 'Username already in use')
    }

    return new AuthDomainError(
      'AUTH_IDENTIFIER_TAKEN',
      'Account identifier already in use'
    )
  }

  private static isMongoDuplicateKeyError(
    error: unknown
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    )
  }
}