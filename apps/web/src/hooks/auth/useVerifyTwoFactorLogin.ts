import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/useAuthStore'

interface VerifyTwoFactorLoginPayload {
  code: string
}

interface User {
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

interface VerifyTwoFactorLoginResponse {
  success: boolean
  message: string
  data?: {
    accessToken?: string
    user?: User
    redirectPath?: LoginRedirectPath
  }
}

interface ApiErrorResponse {
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
    VerifyTwoFactorLoginResponse,
    AxiosError<ApiErrorResponse>,
    VerifyTwoFactorLoginPayload
  >({
    mutationFn: async (payload) => {
      const response =
        await api.post<VerifyTwoFactorLoginResponse>(
          '/auth/2fa/verify-login',
          payload
        )

      return response.data
    },

    onSuccess: (response) => {
      const user = response.data?.user
      const accessToken = response.data?.accessToken
      const redirectPath =
        response.data?.redirectPath || '/dashboard'

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