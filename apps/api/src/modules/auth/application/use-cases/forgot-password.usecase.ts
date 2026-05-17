import { authRepository } from '../../auth.repository'
import { sendMail } from '../../../../infrastructure/email/email.client'
import { otpEmailTemplate } from '../../../../shared/email/email.templates'
import {
  sendPhoneOtp,
} from '../../../../infrastructure/sms/message-central.client'
import { phoneOtpSessionCache } from '../../../../infrastructure/cache/phone-otp-session.cache'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'
import { generateOtp } from '../services/otp.service'

export class ForgotPasswordUseCase {
  async execute(identifier: string) {
    const parsedIdentifier = normalizeIdentifier(identifier)

    const user = await authRepository.findByIdentifier(parsedIdentifier.value)

    if (!user) return

    if (parsedIdentifier.email) {
      const otp = generateOtp()

      await authRepository.saveOtp({
        email: parsedIdentifier.email,
        otp,
        purpose: 'password_reset',
      })

      await sendMail(
        parsedIdentifier.email,
        'Reset your Imminiq password',
        otpEmailTemplate({
          otp,
          type: 'reset_password',
        })
      )

      return
    }

    if (parsedIdentifier.phone) {
      const { verificationId } = await sendPhoneOtp(parsedIdentifier.phone)

      await phoneOtpSessionCache.saveVerificationId(
        parsedIdentifier.phone,
        'password_reset',
        verificationId
      )
    }
  }
}
