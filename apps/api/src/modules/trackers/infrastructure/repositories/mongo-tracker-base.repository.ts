import { Types } from 'mongoose'

import { TrackerDomainError } from '../../domain/errors/tracker-domain.error'
import type { ErrorMapper } from './mongo-tracker-error.mapper'
import { MongoTrackerMapper } from './mongo-tracker.mapper'

export abstract class MongoTrackerBaseRepository {
  constructor(protected readonly mapper = new MongoTrackerMapper()) {}

  protected toObjectId(value: string): Types.ObjectId {
    return this.mapper.toObjectId(value)
  }

  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof TrackerDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new TrackerDomainError(code, message)
    }
  }
}