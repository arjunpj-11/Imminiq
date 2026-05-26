import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import { ApiError } from '../../../../shared/utils/ApiError'
import {
  SECURITY_ATTEMPT_POLICIES,
  securityAttemptCache,
} from '../../../../infrastructure/cache/security-attempt.cache'
import {
  verifyPhoneOtp,
} from '../../../../infrastructure/sms/message-central.client'
import { phoneOtpSessionCache } from '../../../../infrastructure/cache/phone-otp-session.cache'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'

const VERIFY_ACCOUNT_SCOPE = 'auth_verify_account_otp' as const

const assertOtpVerificationAllowed = async (
  identifier: string
) => {
  const blocked = await securityAttemptCache.isBlocked(
    VERIFY_ACCOUNT_SCOPE,
    identifier
  )

  if (!blocked) return

  throw new ApiError(
    429,
    'Too many invalid verification attempts. Request a new OTP or try again later.',
    'OTP_VERIFICATION_TEMPORARILY_BLOCKED'
  )
}

const recordInvalidOtpAttempt = async (
  identifier: string
) => {
  const result = await securityAttemptCache.recordFailure(
    VERIFY_ACCOUNT_SCOPE,
    identifier,
    SECURITY_ATTEMPT_POLICIES.otpVerification
  )

  if (result.blocked) {
    throw new ApiError(
      429,
      'Too many invalid verification attempts. Request a new OTP or try again later.',
      'OTP_VERIFICATION_TEMPORARILY_BLOCKED'
    )
  }
}

export class VerifyAccountUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(identifier: string, otp: string) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    await assertOtpVerificationAllowed(parsedIdentifier.value)

    const user = await this.authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      await recordInvalidOtpAttempt(parsedIdentifier.value)

      throw new ApiError(
        400,
        'Invalid or expired OTP',
        'INVALID_OTP'
      )
    }

    if (parsedIdentifier.method === 'email') {
      const valid = await this.authRepository.verifyOtp({
        email: parsedIdentifier.email,
        otp,
        purpose: 'email_verification',
      })

      if (!valid) {
        await recordInvalidOtpAttempt(parsedIdentifier.value)

        throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
      }

      await securityAttemptCache.clear(
        VERIFY_ACCOUNT_SCOPE,
        parsedIdentifier.value
      )

      if (user.emailVerified) {
        throw new ApiError(
          400,
          'Email is already verified',
          'EMAIL_ALREADY_VERIFIED'
        )
      }

      await this.authRepository.markEmailVerified(user._id.toString())
      return
    }

    if (parsedIdentifier.method === 'phone') {
      const verificationId =
        await phoneOtpSessionCache.getVerificationId(
          parsedIdentifier.phone!,
          'phone_verification'
        )

      if (!verificationId) {
        await recordInvalidOtpAttempt(parsedIdentifier.value)

        throw new ApiError(
          400,
          'OTP session expired. Please request a new OTP.',
          'OTP_SESSION_EXPIRED'
        )
      }

      const valid = await verifyPhoneOtp(verificationId, otp)

      if (!valid) {
        await recordInvalidOtpAttempt(parsedIdentifier.value)

        throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
      }

      await securityAttemptCache.clear(
        VERIFY_ACCOUNT_SCOPE,
        parsedIdentifier.value
      )

      if (user.phoneVerified) {
        throw new ApiError(
          400,
          'Phone is already verified',
          'PHONE_ALREADY_VERIFIED'
        )
      }

      await this.authRepository.markPhoneVerified(user._id.toString())

      await phoneOtpSessionCache.deleteVerificationId(
        parsedIdentifier.phone!,
        'phone_verification'
      )
    }
  }
}
