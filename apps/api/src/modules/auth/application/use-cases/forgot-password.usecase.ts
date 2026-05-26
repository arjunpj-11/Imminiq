import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'

export class ForgotPasswordUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract,
    private readonly authNotificationService: AuthNotificationServiceContract
  ) {}

  async execute(identifier: string) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await this.authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) return

    await this.authNotificationService.sendPasswordResetOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
    })
  }
}
