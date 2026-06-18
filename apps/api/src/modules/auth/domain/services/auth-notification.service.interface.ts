import type { OtpPurpose } from '../value-objects/otp-purpose.vo'
import type { VerificationMethod } from '../value-objects/verification-method.vo'

export interface AuthNotificationServiceContract {
  sendVerificationOtp(data: {
    email?: string
    phone?: string
    method: VerificationMethod
  }): Promise<void>

  sendPasswordResetOtp(data: {
    email?: string
    phone?: string
  }): Promise<void>

  resendOtp(data: {
    email?: string
    phone?: string
    purpose: OtpPurpose
  }): Promise<void>
}
