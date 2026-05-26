import { sendMail } from '../../../infrastructure/email/email.client'
import { otpEmailTemplate } from '../../../shared/email/email.templates'
import {
  sendPhoneOtp,
} from '../../../infrastructure/sms/message-central.client'
import { phoneOtpSessionCache } from '../../../infrastructure/cache/phone-otp-session.cache'

import type { AuthRepositoryContract } from '../domain/repositories/auth.repository.interface'
import type {
  AuthNotificationServiceContract,
} from '../domain/services/auth-notification.service.interface'
import type {
  OtpPurpose,
  VerificationMethod,
} from '../domain/types/auth.types'
import { generateOtp } from '../application/services/otp.service'
import {
  getVerificationPurpose,
} from '../application/services/identifier-normalizer.service'

export class AuthNotificationService
  implements AuthNotificationServiceContract {
  constructor(
    private readonly authRepository: AuthRepositoryContract
  ) {}

  async sendVerificationOtp(data: {
    email?: string
    phone?: string
    method: VerificationMethod
  }) {
    const purpose = getVerificationPurpose(data.method)

    if (data.email) {
      const otp = generateOtp()

      await this.authRepository.saveOtp({
        email: data.email,
        otp,
        purpose,
      })

      await sendMail(
        data.email,
        'Verify your Imminiq account',
        otpEmailTemplate({
          otp,
          type: 'verify_account',
        })
      )

      return
    }

    if (data.phone) {
      const { verificationId } = await sendPhoneOtp(data.phone)

      await phoneOtpSessionCache.saveVerificationId(
        data.phone,
        'phone_verification',
        verificationId
      )
    }
  }

  async sendPasswordResetOtp(data: {
    email?: string
    phone?: string
  }) {
    if (data.email) {
      const otp = generateOtp()

      await this.authRepository.saveOtp({
        email: data.email,
        otp,
        purpose: 'password_reset',
      })

      await sendMail(
        data.email,
        'Reset your Imminiq password',
        otpEmailTemplate({
          otp,
          type: 'reset_password',
        })
      )

      return
    }

    if (data.phone) {
      const { verificationId } = await sendPhoneOtp(data.phone)

      await phoneOtpSessionCache.saveVerificationId(
        data.phone,
        'password_reset',
        verificationId
      )
    }
  }

  async resendOtp(data: {
    email?: string
    phone?: string
    purpose: OtpPurpose
  }) {
    const otp = generateOtp()

    await this.authRepository.saveOtp({
      email: data.email,
      phone: data.phone,
      otp,
      purpose: data.purpose,
    })

    if (data.email) {
      const subjects: Record<OtpPurpose, string> = {
        email_verification: 'Verify your Imminiq account',
        phone_verification: 'Verify your Imminiq account',
        password_reset: 'Reset your Imminiq password',
      }

      await sendMail(
        data.email,
        subjects[data.purpose],
        otpEmailTemplate({
          otp,
          type:
            data.purpose === 'password_reset'
              ? 'reset_password'
              : 'verify_account',
        })
      )
    }
  }
}
