import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import {
  saveBlockedAppealIdentifier,
  saveBlockedModerationMessage,
} from './blockedAppealSession';
import { getUserFacingError } from './user-facing-error';
import { webEnvironment } from '../config/env';
import { getCsrfToken, refreshAuthSession } from './auth-session-refresh';

interface IApiErrorResponse {
  success?: false;
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

interface IRetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: webEnvironment.apiUrl,
  withCredentials: true,
});

const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const isRestrictedAccountError = (status?: number, code?: string) => {
  return (
    status === 403 &&
    (code === 'ACCOUNT_BLOCKED' ||
      code === 'ACCOUNT_BANNED' ||
      code === 'ACCOUNT_DEACTIVATED' ||
      code === 'ACCOUNT_PAUSED')
  );
};

const normalizeApiError = (error: AxiosError<IApiErrorResponse>) => {
  const userMessage = getUserFacingError(error);
  error.message = userMessage;

  if (error.response) {
    const responseData =
      typeof error.response.data === 'object' && error.response.data !== null
        ? error.response.data
        : {};

    error.response.data = {
      ...responseData,
      success: false,
      message: userMessage,
      code: responseData.code ?? `HTTP_${error.response.status}`,
    };
  }

  return error;
};

/**
 * Add access token to every protected request automatically.
 * Add a CSRF header to unsafe requests when the backend-issued CSRF cookie exists.
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let accessToken = useAuthStore.getState().accessToken;
    const requestUrl = config.url || '';
    const isAuthRequest = requestUrl.includes('/auth/');

    if (!accessToken && useAuthStore.getState().isAuthenticated && !isAuthRequest) {
      accessToken = (await refreshAuthSession()).accessToken;
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    const requestMethod = config.method?.toLowerCase() || 'get';

    if (UNSAFE_METHODS.has(requestMethod)) {
      const csrfToken = getCsrfToken();

      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response handling:
 * - Let login hooks handle restricted login failures themselves
 * - Redirect already-authenticated restricted users to /blocked
 * - Refresh expired/missing access tokens using HTTP-only refresh cookie
 * - Retry the original request once after refresh
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<IApiErrorResponse>) => {
    normalizeApiError(error);

    const originalRequest = error.config as IRetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const errorCode = error.response?.data?.code;
    const requestUrl = originalRequest.url || '';

    const isRefreshRequest = requestUrl.includes('/auth/refresh-token');
    const isLoginRequest = requestUrl.includes('/auth/login');
    const isRegisterRequest = requestUrl.includes('/auth/register');
    const isLogoutRequest = requestUrl.includes('/auth/logout');
    const isTwoFactorVerifyLoginRequest = requestUrl.includes('/auth/2fa/verify-login');

    const shouldLetCallerHandleRestrictedError = isLoginRequest || isTwoFactorVerifyLoginRequest;

    if (isRestrictedAccountError(status, errorCode)) {
      saveBlockedModerationMessage(
        error.response?.data?.message || 'Your account access is currently restricted.'
      );
      if (shouldLetCallerHandleRestrictedError) {
        return Promise.reject(error);
      }

      const currentUser = useAuthStore.getState().user;
      const restrictedIdentifier = currentUser?.email || currentUser?.phone || '';

      if (restrictedIdentifier) {
        saveBlockedAppealIdentifier(restrictedIdentifier);
      }

      useAuthStore.getState().clearAuth();

      if (window.location.pathname !== '/blocked') {
        window.location.replace('/blocked');
      }

      return Promise.reject(error);
    }

    const shouldSkipRefresh =
      isRefreshRequest ||
      isLoginRequest ||
      isRegisterRequest ||
      isLogoutRequest ||
      isTwoFactorVerifyLoginRequest;

    if (status !== 401 || originalRequest._retry || shouldSkipRefresh) {
      if (status === 401 && shouldSkipRefresh) {
        useAuthStore.getState().clearAuth();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { accessToken: newAccessToken } = await refreshAuthSession();

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      const axiosRefreshError = normalizeApiError(refreshError as AxiosError<IApiErrorResponse>);

      const refreshStatus = axiosRefreshError.response?.status;
      const refreshErrorCode = axiosRefreshError.response?.data?.code;

      const currentUser = useAuthStore.getState().user;
      const restrictedIdentifier = currentUser?.email || currentUser?.phone || '';

      if (isRestrictedAccountError(refreshStatus, refreshErrorCode) && restrictedIdentifier) {
        saveBlockedAppealIdentifier(restrictedIdentifier);
      }

      if (isRestrictedAccountError(refreshStatus, refreshErrorCode)) {
        saveBlockedModerationMessage(
          axiosRefreshError.response?.data?.message ||
            'Your account access is currently restricted.'
        );
      }

      useAuthStore.getState().clearAuth();

      if (isRestrictedAccountError(refreshStatus, refreshErrorCode)) {
        if (window.location.pathname !== '/blocked') {
          window.location.replace('/blocked');
        }

        return Promise.reject(axiosRefreshError);
      }

      return Promise.reject(axiosRefreshError);
    }
  }
);

export default api;
