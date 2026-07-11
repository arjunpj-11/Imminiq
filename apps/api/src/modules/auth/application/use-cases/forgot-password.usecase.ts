import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthNotificationContract } from '../../domain/services/auth-notification.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.interface'

export class ForgotPasswordUseCase {
  constructor(
    private readonly _authRepository: AuthUserRepositoryContract,
    private readonly _authNotification: AuthNotificationContract,
    private readonly _identifierNormalizer: IdentifierNormalizerContract
  ) {}

  async execute(identifier: string): Promise<void> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier)

    const user = await this._authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) return

    await this._authNotification.sendPasswordResetOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
    })
  }
}
