import { useEffect } from 'react'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/useAuthStore'

interface RefreshTokenResponse {
  success: boolean
  message: string
  data?: {
    accessToken?: string
  }
}

interface AuthUser {
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

interface MeResponse {
  success: boolean
  message: string
  data?: {
    user?: AuthUser
  }
}

export const useRestoreSession = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const setAccessToken = useAuthStore(
    (state) => state.setAccessToken
  )
  const setAuthReady = useAuthStore(
    (state) => state.setAuthReady
  )
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshResponse =
          await api.post<RefreshTokenResponse>(
            '/auth/refresh-token'
          )

        const accessToken =
          refreshResponse.data.data?.accessToken

        if (!accessToken) {
          clearAuth()
          return
        }

        setAccessToken(accessToken)

        const meResponse = await api.get<MeResponse>('/auth/me')
        const user = meResponse.data.data?.user

        if (!user) {
          clearAuth()
          return
        }

        setUser(user)
      } catch {
        clearAuth()
      } finally {
        setAuthReady(true)
      }
    }

    restoreSession()
  }, [clearAuth, setAccessToken, setAuthReady, setUser])
}