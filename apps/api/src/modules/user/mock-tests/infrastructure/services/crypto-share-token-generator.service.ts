import { randomBytes } from 'crypto';
import { MockTestsDomainError } from '../../domain/mock-tests-domain.error';
import type { IShareTokenGenerator } from '../../domain/services/share-token-generator.interface';

export class CryptoShareTokenGenerator implements IShareTokenGenerator {
  generate(): string {
    try {
      return randomBytes(24).toString('base64url');
    } catch {
      throw new MockTestsDomainError(
        'SHARE_TOKEN_GENERATION_FAILED',
        'Failed to generate a mock test share token'
      );
    }
  }
}

export const cryptoShareTokenGenerator = new CryptoShareTokenGenerator();
