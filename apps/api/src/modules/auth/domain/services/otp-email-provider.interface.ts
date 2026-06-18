import type { OtpPurpose } from '../value-objects/otp-purpose.vo'

export type OtpEmailTemplateType = 'verify_account' | 'reset_password'

export interface OtpEmailProviderContract {
  sendOtp(data: {
    email: string
    otp: string
    purpose: OtpPurpose
    templateType: OtpEmailTemplateType
  }): Promise<void>
}
