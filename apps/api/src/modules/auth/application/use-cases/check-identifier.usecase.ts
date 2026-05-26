import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'

export class CheckIdentifierUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(identifier: string) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const existingUser =
      parsedIdentifier.method === 'email'
        ? await this.authRepository.findByEmail(parsedIdentifier.value)
        : await this.authRepository.findByPhone(parsedIdentifier.value)

    if (existingUser) {
      const isVerified =
        parsedIdentifier.method === 'email'
          ? existingUser.emailVerified
          : existingUser.phoneVerified

      return {
        available: !isVerified,
        type: parsedIdentifier.method,
        needsVerification: !isVerified,
      }
    }

    return {
      available: true,
      type: parsedIdentifier.method,
      needsVerification: false,
    }
  }
}
