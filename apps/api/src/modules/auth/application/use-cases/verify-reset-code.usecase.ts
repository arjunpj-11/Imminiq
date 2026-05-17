import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import {
  verifyPhoneOtp,
} from '../../../../infrastructure/sms/message-central.client'
import { phoneOtpSessionCache } from '../../../../infrastructure/cache/phone-otp-session.cache'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'
import { generatePasswordResetToken } from '../services/password-reset-token.service'

export class VerifyResetCodeUseCase {
  async execute(identifier: string, otp: string) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    if (parsedIdentifier.email) {
      const valid = await authRepository.verifyOtp({
        email: parsedIdentifier.email,
        otp,
        purpose: 'password_reset',
      })

      if (!valid) {
        throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
      }
    }

    if (parsedIdentifier.phone) {
      const verificationId =
        await phoneOtpSessionCache.getVerificationId(
          parsedIdentifier.phone,
          'password_reset'
        )

      if (!verificationId) {
        throw new ApiError(
          400,
          'OTP session expired. Please request a new OTP.',
          'OTP_SESSION_EXPIRED'
        )
      }

      const valid = await verifyPhoneOtp(verificationId, otp)

      if (!valid) {
        throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
      }

      await phoneOtpSessionCache.deleteVerificationId(
        parsedIdentifier.phone,
        'password_reset'
      )
    }

    return {
      resetToken: generatePasswordResetToken(user._id.toString()),
    }
  }
}
