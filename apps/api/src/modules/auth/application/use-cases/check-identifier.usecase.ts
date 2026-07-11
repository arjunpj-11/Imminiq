import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface'
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface'

export class CheckIdentifierUseCase {
  constructor(
    private readonly _authRepository: IAuthUserRepository,
    private readonly _identifierNormalizer: IIdentifierNormalizer
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
