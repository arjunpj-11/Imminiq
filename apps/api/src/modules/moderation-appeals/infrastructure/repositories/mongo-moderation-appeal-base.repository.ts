import { Types } from 'mongoose'

import { ModerationAppealDomainError } from '../../domain/errors/moderation-appeal-domain.error'
import type { ErrorMapper } from './mongo-moderation-appeal-error.mapper'
import type { NormalizedIdentifier } from './mongo-moderation-appeal.types'

export abstract class MongoModerationAppealBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof ModerationAppealDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new ModerationAppealDomainError(code, message)
    }
  }

  protected normalizeText(value: string): string {
    return value.trim()
  }

  protected normalizePhone(phone: string): string {
    return phone.trim().replace(/\s/g, '')
  }

  protected normalizeIdentifier(identifier: string): NormalizedIdentifier {
    const value = this.normalizeText(identifier)
    const isEmail = value.includes('@')

    return {
      value: isEmail ? value.toLowerCase() : this.normalizePhone(value),
      isEmail,
    }
  }

  protected toObjectIdOrNull(value: string): Types.ObjectId | null {
    if (!Types.ObjectId.isValid(value)) {
      return null
    }

    return new Types.ObjectId(value)
  }

  protected toObjectIdOrThrow(value: string): Types.ObjectId {
    const objectId = this.toObjectIdOrNull(value)

    if (!objectId) {
      throw new ModerationAppealDomainError(
        'INVALID_OBJECT_ID',
        'Invalid moderation appeal object id',
      )
    }

    return objectId
  }
}