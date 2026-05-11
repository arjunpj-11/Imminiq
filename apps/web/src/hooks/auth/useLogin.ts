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
}

interface LoginResponse {
  success: boolean
  message: string
  data?: {
    user?: User
  }
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
}

export const useLogin = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation<LoginResponse, AxiosError<ApiErrorResponse>, LoginPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<LoginResponse>('/auth/login', payload)
      return response.data
    },

    onSuccess: (data) => {
      const user = data.data?.user

      if (!user) {
        console.error('Login succeeded, but user was not returned from backend.')
        return
      }

      setUser(user)

      navigate('/dashboard', {
        replace: true,
      })
    },

    onError: (error) => {
      console.error(
        error.response?.data?.message || 'Login failed. Please try again.'
      )
    },
  })
}