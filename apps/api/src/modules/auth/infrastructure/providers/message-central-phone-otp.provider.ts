import {
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../../../../infrastructure/sms/message-central.client'
import { AuthDomainError } from '../../domain/errors/auth-domain.error'
import type { PhoneOtpProviderContract } from '../../domain/services/phone-otp-provider.interface'

export class MessageCentralPhoneOtpProvider implements PhoneOtpProviderContract {
  async sendOtp(phone: string): Promise<{ verificationId: string }> {
    const result = await sendPhoneOtp(phone)

    if (!result.verificationId) {
      throw new AuthDomainError(
        'PHONE_OTP_SEND_FAILED',
        'Failed to send phone OTP'
      )
    }

    return result
  }

  async verifyOtp(verificationId: string, otp: string): Promise<boolean> {
    return verifyPhoneOtp(verificationId, otp)
  }
}

export const messageCentralPhoneOtpProvider =
  new MessageCentralPhoneOtpProvider()
