import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import {
  verifyPhoneOtp,
} from '../../../../infrastructure/sms/message-central.client'
import { phoneOtpSessionCache } from '../../../../infrastructure/cache/phone-otp-session.cache'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'

export class VerifyAccountUseCase {
  async execute(identifier: string, otp: string) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    if (parsedIdentifier.method === 'email') {
      const valid = await authRepository.verifyOtp({
        email: parsedIdentifier.email,
        otp,
        purpose: 'email_verification',
      })

      if (!valid) {
        throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
      }

      if (user.emailVerified) {
        throw new ApiError(
          400,
          'Email is already verified',
          'EMAIL_ALREADY_VERIFIED'
        )
      }

      await authRepository.markEmailVerified(user._id.toString())
      return
    }

    if (parsedIdentifier.method === 'phone') {
      const verificationId =
        await phoneOtpSessionCache.getVerificationId(
          parsedIdentifier.phone!,
          'phone_verification'
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

      if (user.phoneVerified) {
        throw new ApiError(
          400,
          'Phone is already verified',
          'PHONE_ALREADY_VERIFIED'
        )
      }

      await authRepository.markPhoneVerified(user._id.toString())

      await phoneOtpSessionCache.deleteVerificationId(
        parsedIdentifier.phone!,
        'phone_verification'
      )
    }
  }
}
