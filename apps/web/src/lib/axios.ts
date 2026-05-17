import axios from 'axios'
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { saveBlockedAppealIdentifier } from './blockedAppealSession'

interface RefreshTokenResponse {
  success: boolean
  message: string
  data?: {
    accessToken?: string
  }
}

interface ApiErrorResponse {
  success?: boolean
  message?: string
  code?: string
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

const isRestrictedAccountError = (
  status?: number,
  code?: string
) => {
  return (
    status === 403 &&
    (
      code === 'ACCOUNT_BLOCKED' ||
      code === 'ACCOUNT_BANNED' ||
      code === 'ACCOUNT_DEACTIVATED' ||
      code === 'ACCOUNT_PAUSED'
    )
  )
}

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
 * Response handling:
 * - Let login hooks handle restricted login failures themselves
 * - Redirect already-authenticated restricted users to /blocked
 * - Refresh expired/missing access tokens using HTTP-only refresh cookie
 * - Retry the original request once after refresh
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest =
      error.config as RetryableRequestConfig | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const errorCode = error.response?.data?.code
    const requestUrl = originalRequest.url || ''

    const isRefreshRequest = requestUrl.includes('/auth/refresh-token')
    const isLoginRequest = requestUrl.includes('/auth/login')
    const isRegisterRequest = requestUrl.includes('/auth/register')
    const isLogoutRequest = requestUrl.includes('/auth/logout')
    const isTwoFactorVerifyLoginRequest =
      requestUrl.includes('/auth/2fa/verify-login')

    /**
     * Login-specific blocked errors must be handled by the login hooks,
     * because they know which identifier the user just entered.
     *
     * If Axios redirects first, it can accidentally restore or save the wrong
     * previous user context.
     */
    const shouldLetCallerHandleRestrictedError =
      isLoginRequest || isTwoFactorVerifyLoginRequest

    if (isRestrictedAccountError(status, errorCode)) {
      if (shouldLetCallerHandleRestrictedError) {
        return Promise.reject(error)
      }

      const currentUser = useAuthStore.getState().user
      const restrictedIdentifier =
        currentUser?.email || currentUser?.phone || ''

      if (restrictedIdentifier) {
        saveBlockedAppealIdentifier(restrictedIdentifier)
      }

      useAuthStore.getState().clearAuth()

      if (window.location.pathname !== '/blocked') {
        window.location.replace('/blocked')
      }

      return Promise.reject(error)
    }

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
        throw new Error(
          'Refresh succeeded but no access token was returned'
        )
      }

      useAuthStore.getState().setAccessToken(newAccessToken)

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      const axiosRefreshError =
        refreshError as AxiosError<ApiErrorResponse>

      const refreshStatus = axiosRefreshError.response?.status
      const refreshErrorCode =
        axiosRefreshError.response?.data?.code

      const currentUser = useAuthStore.getState().user
      const restrictedIdentifier =
        currentUser?.email || currentUser?.phone || ''

      if (
        isRestrictedAccountError(
          refreshStatus,
          refreshErrorCode
        ) &&
        restrictedIdentifier
      ) {
        saveBlockedAppealIdentifier(restrictedIdentifier)
      }

      useAuthStore.getState().clearAuth()

      if (
        isRestrictedAccountError(
          refreshStatus,
          refreshErrorCode
        )
      ) {
        if (window.location.pathname !== '/blocked') {
          window.location.replace('/blocked')
        }

        return Promise.reject(refreshError)
      }

      return Promise.reject(refreshError)
    }
  }
)

export default api