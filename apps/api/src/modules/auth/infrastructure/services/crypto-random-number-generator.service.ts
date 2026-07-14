import crypto from 'crypto';

import type { IRandomNumberGenerator } from '../../domain/services/random-number-generator.interface';

export class CryptoRandomNumberGenerator implements IRandomNumberGenerator {
  integer(minInclusive: number, maxExclusive: number): number {
    return crypto.randomInt(minInclusive, maxExclusive);
  }
}

export const cryptoRandomNumberGenerator = new CryptoRandomNumberGenerator();
