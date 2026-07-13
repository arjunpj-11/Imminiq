import { TrackerDomainError } from '../../../domain/tracker-domain.error';
import type { MongoDuplicateKeyError } from './mongo-tracker.types';

export type ErrorMapper = (error: unknown) => TrackerDomainError | null;

export class MongoTrackerErrorMapper {
  static mapDuplicateTrackerRecordError(error: unknown): TrackerDomainError | null {
    if (!MongoTrackerErrorMapper.isDuplicateKeyError(error)) {
      return null;
    }

    return new TrackerDomainError('DUPLICATE_TRACKER_RECORD', 'Tracker record already exists');
  }

  private static isDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as MongoDuplicateKeyError).code === 11000
    );
  }
}
