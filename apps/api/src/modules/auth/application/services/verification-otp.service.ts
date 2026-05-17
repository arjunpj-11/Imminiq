import { authRepository } from '../../auth.repository'
import { sendMail } from '../../../../infrastructure/email/email.client'
import { otpEmailTemplate } from '../../../../shared/email/email.templates'
import {
  sendPhoneOtp,
} from '../../../../infrastructure/sms/message-central.client'
import { phoneOtpSessionCache } from '../../../../infrastructure/cache/phone-otp-session.cache'

import { generateOtp } from './otp.service'
import { getVerificationPurpose } from './identifier-normalizer.service'
import type { VerificationMethod } from '../../domain/types/auth.types'

export const sendVerificationOtp = async (data: {
  email?: string
  phone?: string
  method: VerificationMethod
}) => {
  const purpose = getVerificationPurpose(data.method)

  if (data.email) {
    const otp = generateOtp()

    await authRepository.saveOtp({
      email: data.email,
      otp,
      purpose,
    })

    await sendMail(
      data.email,
      'Verify your Imminiq account',
      otpEmailTemplate({
        otp,
        type: 'verify_account',
      })
    )

    return
  }

  if (data.phone) {
    const { verificationId } = await sendPhoneOtp(data.phone)

    await phoneOtpSessionCache.saveVerificationId(
      data.phone,
      'phone_verification',
      verificationId
    )
  }
}
