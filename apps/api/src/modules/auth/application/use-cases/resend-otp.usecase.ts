import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import { ApiError } from '../../../../shared/utils/ApiError'
import type { OtpPurpose } from '../../domain/types/auth.types'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'

export class ResendOtpUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract,
    private readonly authNotificationService: AuthNotificationServiceContract
  ) {}

  async execute(identifier: string, purpose: OtpPurpose) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await this.authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      return
    }

    if (
      purpose === 'email_verification' &&
      parsedIdentifier.method === 'email' &&
      user.emailVerified
    ) {
      throw new ApiError(
        400,
        'Email is already verified',
        'EMAIL_ALREADY_VERIFIED'
      )
    }

    if (
      purpose === 'phone_verification' &&
      parsedIdentifier.method === 'phone' &&
      user.phoneVerified
    ) {
      throw new ApiError(
        400,
        'Phone is already verified',
        'PHONE_ALREADY_VERIFIED'
      )
    }

    await this.authNotificationService.resendOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      purpose,
    })
  }
}
