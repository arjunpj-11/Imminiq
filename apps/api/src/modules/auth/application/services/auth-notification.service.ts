import { AuthApplicationError } from '../auth-application.error'
import type {
  IAuthNotification,
} from '../../domain/services/auth-notification.interface'
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface'
import type { IOtpEmailProvider } from '../../domain/services/otp-email-provider.interface'
import type { IOtpGenerator } from '../../domain/services/otp-generator.interface'
import type { IOtpStore } from '../../domain/services/otp-store.interface'
import type { IPhoneOtpProvider } from '../../domain/services/phone-otp-provider.interface'
import type {
  PhoneOtpPurpose,
  IPhoneOtpSessionStore,
} from '../../domain/services/phone-otp-session-store.interface'
import type { OtpPurpose } from '../../domain/value-objects/otp-purpose.vo'
import type { VerificationMethod } from '../../domain/value-objects/verification-method.vo'

const isPhoneOtpPurpose = (
  purpose: OtpPurpose
): purpose is PhoneOtpPurpose => {
  return purpose === 'phone_verification' || purpose === 'password_reset'
}

export type { IAuthNotification }

export class AuthNotificationCoordinator
  implements IAuthNotification {
  constructor(
    private readonly _otpStore: IOtpStore,
    private readonly _otpGenerator: IOtpGenerator,
    private readonly _identifierNormalizer: IIdentifierNormalizer,
    private readonly _phoneOtpProvider: IPhoneOtpProvider,
    private readonly _phoneOtpSessionStore: IPhoneOtpSessionStore,
    private readonly _otpEmailProvider: IOtpEmailProvider
  ) {}

  async sendVerificationOtp(data: {
    email?: string
    phone?: string
    method: VerificationMethod
  }): Promise<void> {
    const purpose =
      this._identifierNormalizer.getVerificationPurpose(data.method)

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
    const otp = this._otpGenerator.generate()

    try {
      await this._otpStore.saveOtp({
        email: data.email,
        otp,
        purpose: data.purpose,
      })

      await this._otpEmailProvider.sendOtp({
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
      const { verificationId } = await this._phoneOtpProvider.sendOtp(phone)

      await this._phoneOtpSessionStore.saveVerificationId(
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
