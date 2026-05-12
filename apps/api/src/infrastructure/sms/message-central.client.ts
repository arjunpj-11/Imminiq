import axios from 'axios'
import { env } from '../../config/env'
import { ApiError } from '../../shared/utils/ApiError'

const MESSAGE_CENTRAL_BASE_URL = 'https://cpaas.messagecentral.com'

const getBase64Password = () => {
  return Buffer.from(env.MESSAGE_CENTRAL_PASSWORD).toString('base64')
}

const generateMessageCentralToken = async () => {
  try {
    const response = await axios.get(
      `${MESSAGE_CENTRAL_BASE_URL}/auth/v1/authentication/token`,
      {
        params: {
          customerId: env.MESSAGE_CENTRAL_CUSTOMER_ID,
          key: getBase64Password(),
          scope: 'NEW',
          country: env.MESSAGE_CENTRAL_COUNTRY_CODE,
          email: env.MESSAGE_CENTRAL_EMAIL,
        },
      }
    )

    const token = response.data?.token

    if (!token) {
      throw new Error('Message Central token not returned')
    }

    return token
  } catch (error: any) {
    console.error(
      'Message Central auth token error:',
      error?.response?.data || error?.message
    )

    throw new ApiError(
      500,
      'Failed to authenticate SMS provider',
      'SMS_PROVIDER_AUTH_FAILED'
    )
  }
}

export const sendPhoneOtp = async (phone: string) => {
  try {
    const authToken = await generateMessageCentralToken()

    const response = await axios.post(
      `${MESSAGE_CENTRAL_BASE_URL}/verification/v3/send`,
      null,
      {
        params: {
          countryCode: env.MESSAGE_CENTRAL_COUNTRY_CODE,
          mobileNumber: phone,
          flowType: 'SMS',
          type: 'OTP',
          otpLength: 6,
        },
        headers: {
          authToken,
        },
      }
    )

    const verificationId = response.data?.data?.verificationId

    if (!verificationId) {
      throw new Error('Verification ID not returned')
    }

    return {
      verificationId: String(verificationId),
    }
  } catch (error: any) {
    console.error(
      'Message Central send OTP error:',
      error?.response?.data || error?.message
    )

    throw new ApiError(
      500,
      'Failed to send OTP SMS',
      'OTP_SMS_SEND_FAILED'
    )
  }
}

export const verifyPhoneOtp = async (
  verificationId: string,
  otp: string
) => {
  try {
    const authToken = await generateMessageCentralToken()

    const response = await axios.get(
      `${MESSAGE_CENTRAL_BASE_URL}/verification/v3/validateOtp`,
      {
        params: {
          verificationId,
          code: otp,
          flowType: 'SMS',
        },
        headers: {
          authToken,
        },
      }
    )

    const status = response.data?.data?.verificationStatus

    return status === 'VERIFICATION_COMPLETED'
  } catch (error: any) {
    console.error(
      'Message Central verify OTP error:',
      error?.response?.data || error?.message
    )

    return false
  }
}