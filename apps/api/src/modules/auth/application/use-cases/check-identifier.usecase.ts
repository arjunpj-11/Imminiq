import { authRepository } from '../../auth.repository'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'

export class CheckIdentifierUseCase {
  async execute(identifier: string) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const existingUser =
      parsedIdentifier.method === 'email'
        ? await authRepository.findByEmail(parsedIdentifier.value)
        : await authRepository.findByPhone(parsedIdentifier.value)

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
