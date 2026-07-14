import { randomInt } from 'node:crypto';

import { UploadsDomainError } from '../../domain/uploads-domain.error';
import type { IRandomSeedGenerator } from '../../domain/services/random-seed.interface';

export class CryptoRandomSeedGenerator implements IRandomSeedGenerator {
  createSeed(upperBound: number): number {
    if (!Number.isInteger(upperBound) || upperBound <= 0) {
      throw new UploadsDomainError(
        'INVALID_RANDOM_SEED_BOUND',
        'Random seed upper bound must be a positive integer'
      );
    }

    return randomInt(upperBound);
  }
}

export const cryptoRandomSeedGenerator = new CryptoRandomSeedGenerator();
