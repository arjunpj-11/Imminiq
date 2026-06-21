import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'

export class ForgotPasswordUseCase {
  constructor(
    private readonly authRepository: AuthUserRepositoryContract,
    private readonly authNotificationService: AuthNotificationServiceContract,
    private readonly identifierNormalizer: IdentifierNormalizerContract
  ) {}

  async execute(identifier: string): Promise<void> {
    const parsedIdentifier = this.identifierNormalizer.normalize(identifier)

    const user = await this.authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) return

    await this.authNotificationService.sendPasswordResetOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
    })
  }
}
