import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'

export class CheckIdentifierUseCase {
  constructor(
    private readonly _authRepository: AuthUserRepositoryContract,
    private readonly _identifierNormalizer: IdentifierNormalizerContract
  ) {}

  async execute(identifier: string): Promise<{
    available: boolean
    type: 'email' | 'phone'
    needsVerification: boolean
  }> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier)

    const existingUser =
      parsedIdentifier.method === 'email'
        ? await this._authRepository.findByEmail(parsedIdentifier.value)
        : await this._authRepository.findByPhone(parsedIdentifier.value)

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
