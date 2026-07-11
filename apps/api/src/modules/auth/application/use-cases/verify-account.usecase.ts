import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { PhoneOtpProviderContract } from '../../domain/services/phone-otp-provider.interface'
import type { PhoneOtpSessionStoreContract } from '../../domain/services/phone-otp-session-store.interface'
import type { SecurityAttemptStoreContract } from '../../domain/services/security-attempt-store.interface'
import type { OtpStoreContract } from '../../domain/services/otp-store.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.interface'

const VERIFY_ACCOUNT_SCOPE = 'auth_verify_account_otp' as const

export class VerifyAccountUseCase {
  constructor(
    private readonly _authRepository: AuthUserRepositoryContract,
    private readonly _identifierNormalizer: IdentifierNormalizerContract,
    private readonly _securityAttemptStore: SecurityAttemptStoreContract,
    private readonly _phoneOtpProvider: PhoneOtpProviderContract,
    private readonly _phoneOtpSessionStore: PhoneOtpSessionStoreContract,
    private readonly _otpStore: OtpStoreContract
  ) {}

  async execute(identifier: string, otp: string): Promise<void> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier)

    await this.assertOtpVerificationAllowed(parsedIdentifier.value)

    const user = await this._authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      await this.recordInvalidOtpAttempt(parsedIdentifier.value)

      throw AuthApplicationError.invalidOtp('Invalid or expired OTP')
    }

    if (parsedIdentifier.method === 'email') {
      const valid = await this._otpStore.verifyOtp({
        email: parsedIdentifier.email,
        otp,
        purpose: 'email_verification',
      })

      if (!valid) {
        await this.recordInvalidOtpAttempt(parsedIdentifier.value)

        throw AuthApplicationError.invalidOtp('Invalid or expired OTP')
      }

      await this._securityAttemptStore.clear(
        VERIFY_ACCOUNT_SCOPE,
        parsedIdentifier.value
      )

      if (user.emailVerified) {
        throw AuthApplicationError.emailAlreadyVerified('Email is already verified')
      }

      await this._authRepository.markEmailVerified(user.id)
      return
    }

    if (parsedIdentifier.method === 'phone') {
      const verificationId =
        await this._phoneOtpSessionStore.getVerificationId(
          parsedIdentifier.phone!,
          'phone_verification'
        )

      if (!verificationId) {
        await this.recordInvalidOtpAttempt(parsedIdentifier.value)

        throw AuthApplicationError.otpSessionExpired('OTP session expired. Please request a new OTP.')
      }

      const valid = await this._phoneOtpProvider.verifyOtp(verificationId, otp)

      if (!valid) {
        await this.recordInvalidOtpAttempt(parsedIdentifier.value)

        throw AuthApplicationError.invalidOtp('Invalid or expired OTP')
      }

      await this._securityAttemptStore.clear(
        VERIFY_ACCOUNT_SCOPE,
        parsedIdentifier.value
      )

      if (user.phoneVerified) {
        throw AuthApplicationError.phoneAlreadyVerified('Phone is already verified')
      }

      await this._authRepository.markPhoneVerified(user.id)

      await this._phoneOtpSessionStore.deleteVerificationId(
        parsedIdentifier.phone!,
        'phone_verification'
      )
    }
  }

  private async assertOtpVerificationAllowed(identifier: string): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(
      VERIFY_ACCOUNT_SCOPE,
      identifier
    )

    if (!blocked) return

    throw AuthApplicationError.otpVerificationTemporarilyBlocked('Too many invalid verification attempts. Request a new OTP or try again later.')
  }

  private async recordInvalidOtpAttempt(identifier: string): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      VERIFY_ACCOUNT_SCOPE,
      identifier,
      'otpVerification'
    )

    if (result.blocked) {
      throw AuthApplicationError.otpVerificationTemporarilyBlocked('Too many invalid verification attempts. Request a new OTP or try again later.')
    }
  }
}
