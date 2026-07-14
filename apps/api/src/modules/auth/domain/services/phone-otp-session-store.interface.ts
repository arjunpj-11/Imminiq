import type { OtpPurpose } from '../value-objects/otp-purpose.vo';

export type PhoneOtpPurpose = Extract<OtpPurpose, 'phone_verification' | 'password_reset'>;

export interface IPhoneOtpSessionStore {
  saveVerificationId(
    phone: string,
    purpose: PhoneOtpPurpose,
    verificationId: string
  ): Promise<void>;

  getVerificationId(phone: string, purpose: PhoneOtpPurpose): Promise<string | null>;

  deleteVerificationId(phone: string, purpose: PhoneOtpPurpose): Promise<void>;
}
