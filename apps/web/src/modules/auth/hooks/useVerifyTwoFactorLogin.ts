import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import api from '../../../lib/axios'
import { useAuthStore } from '../store/useAuthStore'

interface IVerifyTwoFactorLoginPayload {
  code: string
}

interface IUser {
  _id: string
  fullName?: string
  username: string
  email?: string
  phone?: string
  role: string
  isPremium?: boolean
  avatarUrl?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  onboardingCompleted?: boolean
}

type LoginRedirectPath =
  | '/dashboard'
  | '/onboarding/step-1'
  | '/admin'

interface IVerifyTwoFactorLoginResponse {
  success: boolean
  message: string
  data?: {
    accessToken?: string
    user?: IUser
    redirectPath?: LoginRedirectPath
  }
}

interface IApiErrorResponse {
  success?: boolean
  message?: string
}

export const useVerifyTwoFactorLogin = () => {
  const navigate = useNavigate()

  const setUser = useAuthStore((state) => state.setUser)
  const setAccessToken = useAuthStore(
    (state) => state.setAccessToken
  )

  return useMutation<
    IVerifyTwoFactorLoginResponse,
    AxiosError<IApiErrorResponse>,
    IVerifyTwoFactorLoginPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<IVerifyTwoFactorLoginResponse>(
          '/auth/2fa/verify-login',
          payload
        )

      return response.data
    },

    onSuccess: (response) => {
      const user = response.data?.user
      const accessToken = response.data?.accessToken
      const redirectPath = ['admin', 'superadmin'].includes(user?.role || '')
        ? '/admin'
        : response.data?.redirectPath || '/dashboard'

      if (!user) {
        console.error(
          '2FA verification succeeded, but user was not returned.'
        )
        return
      }

      if (!accessToken) {
        console.error(
          '2FA verification succeeded, but access token was not returned.'
        )
        return
      }

      setUser(user)
      setAccessToken(accessToken)

      navigate(redirectPath, {
        replace: true,
      })
    },
  })
}
