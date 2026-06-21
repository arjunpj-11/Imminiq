export interface PhoneOtpProviderContract {
  sendOtp(phone: string): Promise<{ verificationId: string }>
  verifyOtp(verificationId: string, otp: string): Promise<boolean>
}
