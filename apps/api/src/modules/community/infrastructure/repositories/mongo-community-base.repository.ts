// apps/api/src/modules/community/infrastructure/repositories/mongo-community-base.repository.ts

import { Types } from 'mongoose'

import { CommunityDomainError } from '../../domain/errors/community-domain.error'
import type { ErrorMapper } from './mongo-community-error.mapper'
import type { MongoIdLike } from './mongo-community.types'

export abstract class MongoCommunityBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof CommunityDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new CommunityDomainError(code, message)
    }
  }

  protected isValidObjectId(value: string): boolean {
    return Types.ObjectId.isValid(value)
  }

  protected toObjectId(value: string): Types.ObjectId {
    if (!this.isValidObjectId(value)) {
      throw new CommunityDomainError('COMMUNITY_INVALID_ID', 'Invalid id')
    }

    return new Types.ObjectId(value)
  }

  protected toExistingObjectId(value: MongoIdLike): Types.ObjectId {
    if (value instanceof Types.ObjectId) {
      return value
    }

    return this.toObjectId(String(value))
  }

  protected normalizeSearch(value?: string): string | undefined {
    const clean = value?.trim()

    if (!clean) {
      return undefined
    }

    return clean.slice(0, 120)
  }

  protected normalizeTopic(topic: string): string {
    return topic.trim().toLowerCase()
  }

  protected escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  protected calculateTotalPages(total: number, limit: number): number {
    return Math.max(Math.ceil(total / limit), 1)
  }
}