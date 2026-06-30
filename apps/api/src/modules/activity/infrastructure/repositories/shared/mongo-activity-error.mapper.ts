import { ActivityDomainError } from '../../../domain/errors/activity-domain.error'
import type { MongoDuplicateKeyError } from './mongo-activity.types'

export type ActivityMongoErrorMapper = (
  error: unknown,
) => ActivityDomainError | null

export class MongoActivityErrorMapper {
  static mapDuplicateEventError(
    error: unknown,
  ): ActivityDomainError | null {
    if (!this.isDuplicateKeyError(error)) {
      return null
    }

    return new ActivityDomainError(
      'ACTIVITY_EVENT_CONFLICT',
      'The activity event key is already used by a different event',
    )
  }

  static isDuplicateKeyError(
    error: unknown,
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    )
  }
}
