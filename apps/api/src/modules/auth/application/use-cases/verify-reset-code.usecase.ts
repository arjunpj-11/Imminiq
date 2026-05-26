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
import { generatePasswordResetToken } from '../services/password-reset-token.service'

const VERIFY_RESET_SCOPE = 'auth_verify_reset_otp' as const

const assertResetOtpAllowed = async (
  identifier: string
) => {
  const blocked = await securityAttemptCache.isBlocked(
    VERIFY_RESET_SCOPE,
    identifier
  )

  if (!blocked) return

  throw new ApiError(
    429,
    'Too many invalid reset-code attempts. Request a new code or try again later.',
    'RESET_CODE_VERIFICATION_TEMPORARILY_BLOCKED'
  )
}

const recordInvalidResetOtp = async (
  identifier: string
) => {
  const result = await securityAttemptCache.recordFailure(
    VERIFY_RESET_SCOPE,
    identifier,
    SECURITY_ATTEMPT_POLICIES.otpVerification
  )

  if (result.blocked) {
    throw new ApiError(
      429,
      'Too many invalid reset-code attempts. Request a new code or try again later.',
      'RESET_CODE_VERIFICATION_TEMPORARILY_BLOCKED'
    )
  }
}

export class VerifyResetCodeUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async execute(identifier: string, otp: string) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    await assertResetOtpAllowed(parsedIdentifier.value)

    const user = await this.authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      await recordInvalidResetOtp(parsedIdentifier.value)

      throw new ApiError(
        400,
        'Invalid or expired OTP',
        'INVALID_OTP'
      )
    }

    if (parsedIdentifier.email) {
      const valid = await this.authRepository.verifyOtp({
        email: parsedIdentifier.email,
        otp,
        purpose: 'password_reset',
      })

      if (!valid) {
        await recordInvalidResetOtp(parsedIdentifier.value)

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
        await recordInvalidResetOtp(parsedIdentifier.value)

        throw new ApiError(
          400,
          'OTP session expired. Please request a new OTP.',
          'OTP_SESSION_EXPIRED'
        )
      }

      const valid = await verifyPhoneOtp(verificationId, otp)

      if (!valid) {
        await recordInvalidResetOtp(parsedIdentifier.value)

        throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP')
      }

      await phoneOtpSessionCache.deleteVerificationId(
        parsedIdentifier.phone,
        'password_reset'
      )
    }

    await securityAttemptCache.clear(
      VERIFY_RESET_SCOPE,
      parsedIdentifier.value
    )

    return {
      resetToken: await generatePasswordResetToken(user._id.toString()),
    }
  }
}
