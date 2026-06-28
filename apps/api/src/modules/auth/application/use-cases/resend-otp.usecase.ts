import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import type { OtpPurpose } from '../../domain/value-objects/otp-purpose.vo'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'

export class ResendOtpUseCase {
  constructor(
    private readonly _authRepository: AuthUserRepositoryContract,
    private readonly _authNotificationService: AuthNotificationServiceContract,
    private readonly _identifierNormalizer: IdentifierNormalizerContract
  ) {}

  async execute(identifier: string, purpose: OtpPurpose): Promise<void> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier)

    const user = await this._authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      return
    }

    if (
      purpose === 'email_verification' &&
      parsedIdentifier.method === 'email' &&
      user.emailVerified
    ) {
      throw AuthApplicationError.emailAlreadyVerified('Email is already verified')
    }

    if (
      purpose === 'phone_verification' &&
      parsedIdentifier.method === 'phone' &&
      user.phoneVerified
    ) {
      throw AuthApplicationError.phoneAlreadyVerified('Phone is already verified')
    }

    await this._authNotificationService.resendOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      purpose,
    })
  }
}
