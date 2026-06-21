import { createHash } from 'node:crypto'

import { SecurityDomainError } from '../../domain/errors/security-domain.error'
import type { ErrorMapper } from './mongo-security-error.mapper'

export abstract class MongoSecurityBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof SecurityDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new SecurityDomainError(code, message)
    }
  }

  protected hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  protected normalizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }
}