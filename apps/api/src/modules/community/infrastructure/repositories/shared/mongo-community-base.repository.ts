import { CommunityDomainError } from '../../../domain/errors/community-domain.error'
import type { ErrorMapper } from './mongo-community-error.mapper'

type ErrorDetails = {
  name?: unknown
  message?: unknown
  code?: unknown
  keyPattern?: unknown
  keyValue?: unknown
  path?: unknown
  value?: unknown
  errors?: unknown
  stack?: unknown
}

export abstract class MongoCommunityBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error: unknown) {
      if (error instanceof CommunityDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      this.logRepositoryError(code, message, error)

      throw new CommunityDomainError(code, message)
    }
  }

  private logRepositoryError(
    code: string,
    message: string,
    error: unknown,
  ): void {
    if (!(error instanceof Error)) {
      console.error('Community repository operation failed', {
        code,
        message,
        originalError: error,
      })

      return
    }

    const details = error as Error & ErrorDetails

    console.error('Community repository operation failed', {
      code,
      message,
      originalError: {
        name: details.name,
        message: details.message,
        mongoCode: details.code,
        keyPattern: details.keyPattern,
        keyValue: details.keyValue,
        path: details.path,
        value: details.value,
        validationErrors: details.errors,
        stack: details.stack,
      },
    })
  }
}