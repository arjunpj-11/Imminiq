import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'

interface ForgotPasswordPayload {
  identifier: string
}

interface ForgotPasswordResponse {
  success?: boolean
  message: string
  data?: {
    verificationTarget?: string
    verificationMethod?: 'email' | 'phone'
  }
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    payload
  )

  return response.data
}

export const useForgotPassword = () => {
  return useMutation<
    ForgotPasswordResponse,
    AxiosError<ApiErrorResponse>,
    ForgotPasswordPayload
  >({
    mutationFn: forgotPassword,
  })
}