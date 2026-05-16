import axios from 'axios'
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '../store/useAuthStore'

interface RefreshTokenResponse {
  success: boolean
  message: string
  data?: {
    accessToken?: string
  }
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

/**
 * Add access token to every protected request automatically.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Refresh-token handling:
 * - If access token is missing/expired and backend returns 401
 * - Call /auth/refresh-token using the HTTP-only refresh cookie
 * - Save the new access token in Zustand
 * - Retry the failed request once
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const requestUrl = originalRequest.url || ''

    const isRefreshRequest = requestUrl.includes('/auth/refresh-token')
    const isLoginRequest = requestUrl.includes('/auth/login')
    const isRegisterRequest = requestUrl.includes('/auth/register')
    const isLogoutRequest = requestUrl.includes('/auth/logout')
    const isTwoFactorVerifyLoginRequest =
      requestUrl.includes('/auth/2fa/verify-login')

    const shouldSkipRefresh =
      isRefreshRequest ||
      isLoginRequest ||
      isRegisterRequest ||
      isLogoutRequest ||
      isTwoFactorVerifyLoginRequest

    if (
      status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh
    ) {
      if (status === 401 && shouldSkipRefresh) {
        useAuthStore.getState().clearAuth()
      }

      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const refreshResponse = await axios.post<RefreshTokenResponse>(
        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
        }
      )

      const newAccessToken =
        refreshResponse.data.data?.accessToken

      if (!newAccessToken) {
        throw new Error('Refresh succeeded but no access token was returned')
      }

      useAuthStore.getState().setAccessToken(newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      useAuthStore.getState().clearAuth()
      return Promise.reject(refreshError)
    }
  }
)

export default api