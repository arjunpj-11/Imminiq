import { randomInt } from 'node:crypto'

import { UploadsDomainError } from '../../domain/errors/uploads-domain.error'
import type { RandomSeedServiceContract } from '../../domain/services/random-seed.service.interface'

export class CryptoRandomSeedService implements RandomSeedServiceContract {
  createSeed(upperBound: number): number {
    if (!Number.isInteger(upperBound) || upperBound <= 0) {
      throw new UploadsDomainError(
        'INVALID_RANDOM_SEED_BOUND',
        'Random seed upper bound must be a positive integer',
      )
    }

    return randomInt(upperBound)
  }
}

export const cryptoRandomSeedService = new CryptoRandomSeedService()
