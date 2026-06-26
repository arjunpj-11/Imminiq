import mongoose from 'mongoose'

import { MockTestsDomainError } from '../../domain/errors/mock-tests-domain.error'
import type { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo'
import type { ErrorMapper } from './mongo-mock-tests-error.mapper'

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'] as const
const SAFE_TAG_PATTERN = /^[a-zA-Z0-9 _-]{1,40}$/

type RepositoryErrorDetails = Error & {
  code?: unknown
  keyPattern?: unknown
  keyValue?: unknown
  path?: unknown
  value?: unknown
  errors?: unknown
  reason?: unknown
}

export abstract class MongoMockTestsBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof MockTestsDomainError) {
        throw error
      }

      this.logRepositoryError(code, message, error)

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new MockTestsDomainError(code, message)
    }
  }

  protected toObjectId(
    value: string,
  ): mongoose.Types.ObjectId | null {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return null
    }

    return new mongoose.Types.ObjectId(value)
  }

  protected toObjectIds(
    values: string[],
  ): mongoose.Types.ObjectId[] {
    return values
      .filter((value) =>
        mongoose.Types.ObjectId.isValid(value),
      )
      .map(
        (value) =>
          new mongoose.Types.ObjectId(value),
      )
  }

  protected sanitizeDifficulty(
    value?: DifficultyLevel,
  ): DifficultyLevel | undefined {
    return value &&
      ALLOWED_DIFFICULTIES.includes(value)
      ? value
      : undefined
  }

  protected sanitizeTags(tags?: string[]): string[] {
    if (!Array.isArray(tags)) {
      return []
    }

    return tags
      .filter(
        (tag): tag is string =>
          typeof tag === 'string',
      )
      .map((tag) => tag.trim())
      .filter((tag) => SAFE_TAG_PATTERN.test(tag))
      .slice(0, 20)
  }

  protected sanitizePage(page: number): number {
    return Number.isInteger(page) && page > 0
      ? page
      : 1
  }

  protected sanitizeLimit(limit: number): number {
    return Number.isInteger(limit) &&
      limit > 0 &&
      limit <= 50
      ? limit
      : 20
  }

  private logRepositoryError(
    code: string,
    message: string,
    error: unknown,
  ): void {
    if (!(error instanceof Error)) {
      console.error(
        'Mock tests repository operation failed',
        {
          code,
          message,
          originalError: error,
        },
      )

      return
    }

    const details = error as RepositoryErrorDetails

    console.error(
      'Mock tests repository operation failed',
      {
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
          reason: details.reason,
          stack: details.stack,
        },
      },
    )
  }
}