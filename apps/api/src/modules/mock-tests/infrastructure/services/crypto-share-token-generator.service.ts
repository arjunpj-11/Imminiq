import { randomBytes } from 'crypto'
import { MockTestsDomainError } from '../../domain/errors/mock-tests-domain.error'
import type { ShareTokenGeneratorServiceContract } from '../../domain/services/share-token-generator.service.interface'

export class CryptoShareTokenGeneratorService
  implements ShareTokenGeneratorServiceContract {
  generate(): string {
    try {
      return randomBytes(24).toString('base64url')
    } catch {
      throw new MockTestsDomainError(
        'SHARE_TOKEN_GENERATION_FAILED',
        'Failed to generate a mock test share token',
      )
    }
  }
}

export const cryptoShareTokenGeneratorService =
  new CryptoShareTokenGeneratorService()
