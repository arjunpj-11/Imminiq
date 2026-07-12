import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface'
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface'
import type { IPendingRegistrationStore } from '../../domain/services/pending-registration-store.interface'

export interface ICheckIdentifierUseCase {
  execute(identifier: string): Promise<{
    available: boolean
    type: 'email' | 'phone'
    needsVerification: boolean
  }>
}

export class CheckIdentifierUseCase implements ICheckIdentifierUseCase {
  constructor(
    private readonly _authRepository: IAuthUserRepository,
    private readonly _identifierNormalizer: IIdentifierNormalizer,
    private readonly _pendingRegistrationStore: IPendingRegistrationStore
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

    const hasPendingRegistration =
      await this._pendingRegistrationStore.exists(parsedIdentifier.value)

    if (hasPendingRegistration) {
      return {
        available: true,
        type: parsedIdentifier.method,
        needsVerification: true,
      }
    }

    return {
      available: true,
      type: parsedIdentifier.method,
      needsVerification: false,
    }
  }
}
