import { AuthApplicationError } from '../auth-application.error'
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface'
import type { IAuthNotification } from '../../domain/services/auth-notification.interface'
import type { OtpPurpose } from '../../domain/value-objects/otp-purpose.vo'
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface'
import type { IPendingRegistrationStore } from '../../domain/services/pending-registration-store.interface'
import { PENDING_REGISTRATION_EXPIRES_SECONDS } from '../../domain/auth.constants'

export interface IResendOtpUseCase {
  execute(identifier: string, purpose: OtpPurpose): Promise<void>
}

export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    private readonly _authRepository: IAuthUserRepository,
    private readonly _authNotification: IAuthNotification,
    private readonly _identifierNormalizer: IIdentifierNormalizer,
    private readonly _pendingRegistrationStore: IPendingRegistrationStore
  ) {}

  async execute(identifier: string, purpose: OtpPurpose): Promise<void> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier)

    const user = await this._authRepository.findByIdentifier(parsedIdentifier.value)

    const pendingRegistration = user
      ? null
      : await this._pendingRegistrationStore.get(parsedIdentifier.value)

    const isPendingAccountVerification =
      Boolean(pendingRegistration) &&
      ((parsedIdentifier.method === 'email' &&
        purpose === 'email_verification') ||
        (parsedIdentifier.method === 'phone' &&
          purpose === 'phone_verification'))

    if (!user && !isPendingAccountVerification) {
      return
    }

    if (pendingRegistration) {
      await this._pendingRegistrationStore.save(
        parsedIdentifier.value,
        pendingRegistration,
        PENDING_REGISTRATION_EXPIRES_SECONDS
      )
    }

    if (
      purpose === 'email_verification' &&
      parsedIdentifier.method === 'email' &&
      user?.emailVerified
    ) {
      throw AuthApplicationError.emailAlreadyVerified('Email is already verified')
    }

    if (
      purpose === 'phone_verification' &&
      parsedIdentifier.method === 'phone' &&
      user?.phoneVerified
    ) {
      throw AuthApplicationError.phoneAlreadyVerified('Phone is already verified')
    }

    await this._authNotification.resendOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      purpose,
    })
  }
}
