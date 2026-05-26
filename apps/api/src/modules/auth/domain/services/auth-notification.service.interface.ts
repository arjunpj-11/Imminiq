import type {
  OtpPurpose,
  VerificationMethod,
} from '../types/auth.types'

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
