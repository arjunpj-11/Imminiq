import { AuthDomainError } from '../../domain/errors/auth-domain.error'
import type { ErrorMapper } from './mongo-auth-error.mapper'

export abstract class MongoAuthBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof AuthDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new AuthDomainError(code, message)
    }
  }

  protected normalizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  protected normalizeUsername(username: string): string {
    return username.toLowerCase().trim()
  }

  protected normalizePhone(phone: string): string {
    return phone.trim().replace(/\s/g, '')
  }

  protected normalizeText(value: string): string {
    return value.trim()
  }
}