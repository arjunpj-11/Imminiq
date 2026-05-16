import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/useAuthStore'

interface LoginPayload {
  identifier: string
  password: string
  rememberMe?: boolean
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

interface StandardLoginData {
  accessToken?: string
  user?: User
  redirectPath?: LoginRedirectPath
  requiresTwoFactor?: false
}

interface TwoFactorRequiredLoginData {
  requiresTwoFactor: true
  challengeExpiresInMinutes?: number
}

type LoginResponseData =
  | StandardLoginData
  | TwoFactorRequiredLoginData

interface LoginResponse {
  success: boolean
  message: string
  data?: LoginResponseData
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

const isTwoFactorRequired = (
  data: LoginResponseData | undefined
): data is TwoFactorRequiredLoginData => {
  return !!data && data.requiresTwoFactor === true
}

export const useLogin = () => {
  const navigate = useNavigate()

  const setUser = useAuthStore((state) => state.setUser)
  const setAccessToken = useAuthStore(
    (state) => state.setAccessToken
  )

  return useMutation<
    LoginResponse,
    AxiosError<ApiErrorResponse>,
    LoginPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<LoginResponse>(
        '/auth/login',
        payload
      )

      return response.data
    },

    onSuccess: (response) => {
      const data = response.data

      if (isTwoFactorRequired(data)) {
        navigate('/two-factor-challenge', {
          replace: true,
        })

        return
      }

      const user = data?.user
      const accessToken = data?.accessToken
      const redirectPath =
        data?.redirectPath || '/dashboard'

      if (!user) {
        console.error(
          'Login succeeded, but user was not returned from backend.'
        )
        return
      }

      if (!accessToken) {
        console.error(
          'Login succeeded, but access token was not returned from backend.'
        )
        return
      }

      setUser(user)
      setAccessToken(accessToken)

      navigate(redirectPath, {
        replace: true,
      })
    },

    onError: (error) => {
      console.error(
        error.response?.data?.message ||
          'Login failed. Please try again.'
      )
    },
  })
}