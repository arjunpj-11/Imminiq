import type { OtpPurpose } from '../value-objects/otp-purpose.vo'

export interface OtpStoreContract {
  saveOtp(data: {
    email?: string
    phone?: string
    otp: string
    purpose: OtpPurpose
  }): Promise<boolean>

  verifyOtp(data: {
    email?: string
    phone?: string
    otp: string
    purpose: OtpPurpose
  }): Promise<boolean>
}
