import { AuthApplicationError } from '../errors/auth-application.error'
import type {
  AuthNotificationServiceContract,
} from '../../domain/services/auth-notification.service.interface'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'
import type { OtpEmailProviderContract } from '../../domain/services/otp-email-provider.interface'
import type { OtpGeneratorContract } from '../../domain/services/otp-generator.service.interface'
import type { OtpStoreContract } from '../../domain/services/otp-store.interface'
import type { PhoneOtpProviderContract } from '../../domain/services/phone-otp-provider.interface'
import type {
  PhoneOtpPurpose,
  PhoneOtpSessionStoreContract,
} from '../../domain/services/phone-otp-session-store.interface'
import type { OtpPurpose } from '../../domain/value-objects/otp-purpose.vo'
import type { VerificationMethod } from '../../domain/value-objects/verification-method.vo'

const isPhoneOtpPurpose = (
  purpose: OtpPurpose
): purpose is PhoneOtpPurpose => {
  return purpose === 'phone_verification' || purpose === 'password_reset'
}

export type { AuthNotificationServiceContract }

export class AuthNotificationService
  implements AuthNotificationServiceContract {
  constructor(
    private readonly otpStore: OtpStoreContract,
    private readonly otpGenerator: OtpGeneratorContract,
    private readonly identifierNormalizer: IdentifierNormalizerContract,
    private readonly phoneOtpProvider: PhoneOtpProviderContract,
    private readonly phoneOtpSessionStore: PhoneOtpSessionStoreContract,
    private readonly otpEmailProvider: OtpEmailProviderContract
  ) {}

  async sendVerificationOtp(data: {
    email?: string
    phone?: string
    method: VerificationMethod
  }): Promise<void> {
    const purpose =
      this.identifierNormalizer.getVerificationPurpose(data.method)

    if (data.email) {
      await this.sendEmailOtp({
        email: data.email,
        purpose,
        templateType: 'verify_account',
      })

      return
    }

    if (data.phone) {
      await this.sendPhoneOtp(data.phone, 'phone_verification')
    }
  }

  async sendPasswordResetOtp(data: {
    email?: string
    phone?: string
  }): Promise<void> {
    if (data.email) {
      await this.sendEmailOtp({
        email: data.email,
        purpose: 'password_reset',
        templateType: 'reset_password',
      })

      return
    }

    if (data.phone) {
      await this.sendPhoneOtp(data.phone, 'password_reset')
    }
  }

  async resendOtp(data: {
    email?: string
    phone?: string
    purpose: OtpPurpose
  }): Promise<void> {
    if (data.email) {
      await this.sendEmailOtp({
        email: data.email,
        purpose: data.purpose,
        templateType:
          data.purpose === 'password_reset'
            ? 'reset_password'
            : 'verify_account',
      })

      return
    }

    if (data.phone) {
      if (!isPhoneOtpPurpose(data.purpose)) {
        throw AuthApplicationError.invalidOtpPurpose(
          'Invalid OTP purpose for phone verification'
        )
      }

      await this.sendPhoneOtp(data.phone, data.purpose)
    }
  }

  private async sendEmailOtp(data: {
    email: string
    purpose: OtpPurpose
    templateType: 'verify_account' | 'reset_password'
  }): Promise<void> {
    const otp = this.otpGenerator.generate()

    try {
      await this.otpStore.saveOtp({
        email: data.email,
        otp,
        purpose: data.purpose,
      })

      await this.otpEmailProvider.sendOtp({
        email: data.email,
        otp,
        purpose: data.purpose,
        templateType: data.templateType,
      })
    } catch (error) {
      if (error instanceof AuthApplicationError) {
        throw error
      }

      throw AuthApplicationError.otpSendFailed()
    }
  }

  private async sendPhoneOtp(
    phone: string,
    purpose: PhoneOtpPurpose
  ): Promise<void> {
    try {
      const { verificationId } = await this.phoneOtpProvider.sendOtp(phone)

      await this.phoneOtpSessionStore.saveVerificationId(
        phone,
        purpose,
        verificationId
      )
    } catch (error) {
      if (error instanceof AuthApplicationError) {
        throw error
      }

      throw AuthApplicationError.otpSendFailed()
    }
  }
}
