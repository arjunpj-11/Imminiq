export interface IPhoneOtpProvider {
  sendOtp(phone: string): Promise<{ verificationId: string }>
  verifyOtp(verificationId: string, otp: string): Promise<boolean>
}
