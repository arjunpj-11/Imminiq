import { TrackerCreationDomainError } from '../../../domain/tracker-creation-domain.error';
import type { MongoDuplicateKeyError } from './mongo-tracker-creation.types';

export type ErrorMapper = (error: unknown) => TrackerCreationDomainError | null;

export class MongoTrackerCreationErrorMapper {
  static mapDuplicateRecordError(error: unknown): TrackerCreationDomainError | null {
    if (!MongoTrackerCreationErrorMapper.isDuplicateKeyError(error)) {
      return null;
    }

    return new TrackerCreationDomainError('DUPLICATE_TRACKER_CREATION_RECORD', 'Duplicate tracker creation record');
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
