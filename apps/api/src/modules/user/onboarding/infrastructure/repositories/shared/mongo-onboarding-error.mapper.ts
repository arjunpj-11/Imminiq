import { OnboardingDomainError } from '../../../domain/onboarding-domain.error';
import type { MongoDuplicateKeyError } from './mongo-onboarding.types';

export type ErrorMapper = (error: unknown) => OnboardingDomainError | null;

export class MongoOnboardingErrorMapper {
  static mapDuplicateRecordError(error: unknown): OnboardingDomainError | null {
    if (!MongoOnboardingErrorMapper.isDuplicateKeyError(error)) {
      return null;
    }

    return new OnboardingDomainError('DUPLICATE_ONBOARDING_RECORD', 'Duplicate onboarding record');
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
