import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { PasswordResetTokenContract } from '../../domain/services/password-reset-token.interface'
import type { PhoneOtpProviderContract } from '../../domain/services/phone-otp-provider.interface'
import type { PhoneOtpSessionStoreContract } from '../../domain/services/phone-otp-session-store.interface'
import type { SecurityAttemptStoreContract } from '../../domain/services/security-attempt-store.interface'
import type { OtpStoreContract } from '../../domain/services/otp-store.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.interface'

const VERIFY_RESET_SCOPE = 'auth_verify_reset_otp' as const

export class VerifyResetCodeUseCase {
  constructor(
    private readonly _authRepository: AuthUserRepositoryContract,
    private readonly _identifierNormalizer: IdentifierNormalizerContract,
    private readonly _securityAttemptStore: SecurityAttemptStoreContract,
    private readonly _phoneOtpProvider: PhoneOtpProviderContract,
    private readonly _phoneOtpSessionStore: PhoneOtpSessionStoreContract,
    private readonly _passwordResetToken: PasswordResetTokenContract,
    private readonly _otpStore: OtpStoreContract
  ) {}

  async execute(identifier: string, otp: string): Promise<{ resetToken: string }> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier)

    await this.assertResetOtpAllowed(parsedIdentifier.value)

    const user = await this._authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      await this.recordInvalidResetOtp(parsedIdentifier.value)

      throw AuthApplicationError.invalidOtp('Invalid or expired OTP')
    }

    if (parsedIdentifier.email) {
      const valid = await this._otpStore.verifyOtp({
        email: parsedIdentifier.email,
        otp,
        purpose: 'password_reset',
      })

      if (!valid) {
        await this.recordInvalidResetOtp(parsedIdentifier.value)

        throw AuthApplicationError.invalidOtp('Invalid or expired OTP')
      }
    }

    if (parsedIdentifier.phone) {
      const verificationId =
        await this._phoneOtpSessionStore.getVerificationId(
          parsedIdentifier.phone,
          'password_reset'
        )

      if (!verificationId) {
        await this.recordInvalidResetOtp(parsedIdentifier.value)

        throw AuthApplicationError.otpSessionExpired('OTP session expired. Please request a new OTP.')
      }

      const valid = await this._phoneOtpProvider.verifyOtp(verificationId, otp)

      if (!valid) {
        await this.recordInvalidResetOtp(parsedIdentifier.value)

        throw AuthApplicationError.invalidOtp('Invalid or expired OTP')
      }

      await this._phoneOtpSessionStore.deleteVerificationId(
        parsedIdentifier.phone,
        'password_reset'
      )
    }

    await this._securityAttemptStore.clear(
      VERIFY_RESET_SCOPE,
      parsedIdentifier.value
    )

    return {
      resetToken: await this._passwordResetToken.generate(user.id),
    }
  }

  private async assertResetOtpAllowed(identifier: string): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(
      VERIFY_RESET_SCOPE,
      identifier
    )

    if (!blocked) return

    throw AuthApplicationError.resetCodeVerificationTemporarilyBlocked('Too many invalid reset-code attempts. Request a new code or try again later.')
  }

  private async recordInvalidResetOtp(identifier: string): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      VERIFY_RESET_SCOPE,
      identifier,
      'otpVerification'
    )

    if (result.blocked) {
      throw AuthApplicationError.resetCodeVerificationTemporarilyBlocked('Too many invalid reset-code attempts. Request a new code or try again later.')
    }
  }
}
