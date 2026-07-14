import { ModerationAppealDomainError } from '../../../domain/moderation-appeal-domain.error';
import type { MongoDuplicateKeyError } from './mongo-moderation-appeal.types';

export type ErrorMapper = (error: unknown) => ModerationAppealDomainError | null;

export class MongoModerationAppealErrorMapper {
  static mapDuplicateCreateError(error: unknown): ModerationAppealDomainError | null {
    if (!MongoModerationAppealErrorMapper.isMongoDuplicateKeyError(error)) {
      return null;
    }

    return new ModerationAppealDomainError(
      'DUPLICATE_APPEAL_CASE_ID',
      'Moderation appeal case id already exists'
    );
  }

  private static isMongoDuplicateKeyError(error: unknown): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as MongoDuplicateKeyError).code === 11000
    );
  }
}
