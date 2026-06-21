import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { PasswordResetTokenServiceContract } from '../../domain/services/password-reset-token.service.interface'
import type { PhoneOtpProviderContract } from '../../domain/services/phone-otp-provider.interface'
import type { PhoneOtpSessionStoreContract } from '../../domain/services/phone-otp-session-store.interface'
import type { SecurityAttemptStoreContract } from '../../domain/services/security-attempt-store.interface'
import type { OtpStoreContract } from '../../domain/services/otp-store.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'

const VERIFY_RESET_SCOPE = 'auth_verify_reset_otp' as const

export class VerifyResetCodeUseCase {
  constructor(
    private readonly authRepository: AuthUserRepositoryContract,
    private readonly identifierNormalizer: IdentifierNormalizerContract,
    private readonly securityAttemptStore: SecurityAttemptStoreContract,
    private readonly phoneOtpProvider: PhoneOtpProviderContract,
    private readonly phoneOtpSessionStore: PhoneOtpSessionStoreContract,
    private readonly passwordResetTokenService: PasswordResetTokenServiceContract,
    private readonly otpStore: OtpStoreContract
  ) {}

  async execute(identifier: string, otp: string): Promise<{ resetToken: string }> {
    const parsedIdentifier = this.identifierNormalizer.normalize(identifier)

    await this.assertResetOtpAllowed(parsedIdentifier.value)

    const user = await this.authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      await this.recordInvalidResetOtp(parsedIdentifier.value)

      throw AuthApplicationError.invalidOtp('Invalid or expired OTP')
    }

    if (parsedIdentifier.email) {
      const valid = await this.otpStore.verifyOtp({
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
        await this.phoneOtpSessionStore.getVerificationId(
          parsedIdentifier.phone,
          'password_reset'
        )

      if (!verificationId) {
        await this.recordInvalidResetOtp(parsedIdentifier.value)

        throw AuthApplicationError.otpSessionExpired('OTP session expired. Please request a new OTP.')
      }

      const valid = await this.phoneOtpProvider.verifyOtp(verificationId, otp)

      if (!valid) {
        await this.recordInvalidResetOtp(parsedIdentifier.value)

        throw AuthApplicationError.invalidOtp('Invalid or expired OTP')
      }

      await this.phoneOtpSessionStore.deleteVerificationId(
        parsedIdentifier.phone,
        'password_reset'
      )
    }

    await this.securityAttemptStore.clear(
      VERIFY_RESET_SCOPE,
      parsedIdentifier.value
    )

    return {
      resetToken: await this.passwordResetTokenService.generate(user.id),
    }
  }

  private async assertResetOtpAllowed(identifier: string): Promise<void> {
    const blocked = await this.securityAttemptStore.isBlocked(
      VERIFY_RESET_SCOPE,
      identifier
    )

    if (!blocked) return

    throw AuthApplicationError.resetCodeVerificationTemporarilyBlocked('Too many invalid reset-code attempts. Request a new code or try again later.')
  }

  private async recordInvalidResetOtp(identifier: string): Promise<void> {
    const result = await this.securityAttemptStore.recordFailure(
      VERIFY_RESET_SCOPE,
      identifier,
      'otpVerification'
    )

    if (result.blocked) {
      throw AuthApplicationError.resetCodeVerificationTemporarilyBlocked('Too many invalid reset-code attempts. Request a new code or try again later.')
    }
  }
}
