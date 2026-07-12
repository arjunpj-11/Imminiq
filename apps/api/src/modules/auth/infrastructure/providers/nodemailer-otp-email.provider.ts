import { sendMail } from '../../../../infrastructure/email/email.client'
import { otpEmailTemplate } from '../../../../shared/email/email.templates'
import { AuthDomainError } from '../../domain/auth-domain.error'
import type { IOtpEmailProvider } from '../../domain/services/otp-email-provider.interface'
import type { OtpPurpose } from '../../domain/value-objects/otp-purpose.vo'

const OTP_EMAIL_SUBJECTS: Record<OtpPurpose, string> = {
  email_verification: 'Verify your Imminiq account',
  phone_verification: 'Verify your Imminiq account',
  password_reset: 'Reset your Imminiq password',
}

export class NodemailerOtpEmailProvider implements IOtpEmailProvider {
  async sendOtp(data: {
    email: string
    otp: string
    purpose: OtpPurpose
    templateType: 'verify_account' | 'reset_password'
  }): Promise<void> {
    try {
      await sendMail(
        data.email,
        OTP_EMAIL_SUBJECTS[data.purpose],
        otpEmailTemplate({
          otp: data.otp,
          type: data.templateType,
        })
      )
    } catch {
      throw new AuthDomainError(
        'OTP_EMAIL_SEND_FAILED',
        'Failed to send OTP email'
      )
    }
  }
}

export const nodemailerOtpEmailProvider = new NodemailerOtpEmailProvider()
