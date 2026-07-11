import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'

interface IForgotPasswordPayload {
  identifier: string
}

interface IForgotPasswordResponse {
  success?: boolean
  message: string
  data?: {
    verificationTarget?: string
    verificationMethod?: 'email' | 'phone'
  }
}

interface IApiErrorResponse {
  success?: boolean
  message?: string
}

const forgotPassword = async (
  payload: IForgotPasswordPayload
): Promise<IForgotPasswordResponse> => {
  const response = await api.post<IForgotPasswordResponse>(
    '/auth/forgot-password',
    payload
  )

  return response.data
}

export const useForgotPassword = () => {
  return useMutation<
    IForgotPasswordResponse,
    AxiosError<IApiErrorResponse>,
    IForgotPasswordPayload
  >({
    mutationFn: forgotPassword,
  })
}