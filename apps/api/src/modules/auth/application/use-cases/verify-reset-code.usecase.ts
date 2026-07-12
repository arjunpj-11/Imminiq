import { AuthApplicationError } from '../auth-application.error'
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface'
import type { IPasswordResetToken } from '../../domain/services/password-reset-token.interface'
import type { IPhoneOtpProvider } from '../../domain/services/phone-otp-provider.interface'
import type { IPhoneOtpSessionStore } from '../../domain/services/phone-otp-session-store.interface'
import type { ISecurityAttemptStore } from '../../domain/services/security-attempt-store.interface'
import type { IOtpStore } from '../../domain/services/otp-store.interface'
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface'

const VERIFY_RESET_SCOPE = 'auth_verify_reset_otp' as const

export interface IVerifyResetCodeUseCase {
  execute(identifier: string, otp: string): Promise<{ resetToken: string }>
}

export class VerifyResetCodeUseCase implements IVerifyResetCodeUseCase {
  constructor(
    private readonly _authRepository: IAuthUserRepository,
    private readonly _identifierNormalizer: IIdentifierNormalizer,
    private readonly _securityAttemptStore: ISecurityAttemptStore,
    private readonly _phoneOtpProvider: IPhoneOtpProvider,
    private readonly _phoneOtpSessionStore: IPhoneOtpSessionStore,
    private readonly _passwordResetToken: IPasswordResetToken,
    private readonly _otpStore: IOtpStore
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
