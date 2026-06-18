import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'

export class CheckIdentifierUseCase {
  constructor(
    private readonly authRepository: AuthUserRepositoryContract,
    private readonly identifierNormalizer: IdentifierNormalizerContract
  ) {}

  async execute(identifier: string): Promise<{
    available: boolean
    type: 'email' | 'phone'
    needsVerification: boolean
  }> {
    const parsedIdentifier = this.identifierNormalizer.normalize(identifier)

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
