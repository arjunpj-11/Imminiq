import { SecurityDomainError } from '../../../domain/security-domain.error';
import type { MongoDuplicateKeyError } from './mongo-security.types';

export type ErrorMapper = (error: unknown) => SecurityDomainError | null;

export class MongoSecurityErrorMapper {
  static mapDuplicateSecurityRecordError(error: unknown): SecurityDomainError | null {
    if (!MongoSecurityErrorMapper.isDuplicateKeyError(error)) {
      return null;
    }

    return new SecurityDomainError('DUPLICATE_SECURITY_RECORD', 'A security record already exists');
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
