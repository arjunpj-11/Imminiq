import crypto from 'crypto'

import type { RandomNumberGeneratorContract } from '../../domain/services/random-number-generator.service.interface'

export class CryptoRandomNumberGeneratorService
  implements RandomNumberGeneratorContract {
  integer(minInclusive: number, maxExclusive: number): number {
    return crypto.randomInt(minInclusive, maxExclusive)
  }
}

export const cryptoRandomNumberGeneratorService =
  new CryptoRandomNumberGeneratorService()
