import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'

export class ForgotPasswordUseCase {
  constructor(
    private readonly _authRepository: AuthUserRepositoryContract,
    private readonly _authNotificationService: AuthNotificationServiceContract,
    private readonly _identifierNormalizer: IdentifierNormalizerContract
  ) {}

  async execute(identifier: string): Promise<void> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier)

    const user = await this._authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) return

    await this._authNotificationService.sendPasswordResetOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
    })
  }
}
