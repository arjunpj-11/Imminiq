import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import { sendMail } from '../../../../infrastructure/email/email.client'
import { otpEmailTemplate } from '../../../../shared/email/email.templates'
import type { OtpPurpose } from '../../domain/types/auth.types'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'
import { generateOtp } from '../services/otp.service'

export class ResendOtpUseCase {
  async execute(identifier: string, purpose: OtpPurpose) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    if (
      purpose === 'email_verification' &&
      parsedIdentifier.method === 'email' &&
      user.emailVerified
    ) {
      throw new ApiError(
        400,
        'Email is already verified',
        'EMAIL_ALREADY_VERIFIED'
      )
    }

    if (
      purpose === 'phone_verification' &&
      parsedIdentifier.method === 'phone' &&
      user.phoneVerified
    ) {
      throw new ApiError(
        400,
        'Phone is already verified',
        'PHONE_ALREADY_VERIFIED'
      )
    }

    const otp = generateOtp()

    await authRepository.saveOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      otp,
      purpose,
    })

    if (parsedIdentifier.email) {
      const subjects: Record<OtpPurpose, string> = {
        email_verification: 'Verify your Imminiq account',
        phone_verification: 'Verify your Imminiq account',
        password_reset: 'Reset your Imminiq password',
      }

      await sendMail(
        parsedIdentifier.email,
        subjects[purpose],
        otpEmailTemplate({
          otp,
          type:
            purpose === 'password_reset'
              ? 'reset_password'
              : 'verify_account',
        })
      )
    }
  }
}
