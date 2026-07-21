import axios from 'axios';

import { webEnvironment } from '../config/env';
import { useAuthStore, type IAuthUser } from '../store/useAuthStore';

interface IRefreshSessionResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
    user?: IAuthUser;
  };
}

let refreshInFlight: Promise<{ accessToken: string; user: IAuthUser }> | null = null;

const getCookieValue = (cookieName: string): string | null => {
  const prefix = `${cookieName}=`;
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
};

export const getCsrfToken = () => getCookieValue('csrfToken');

const requestFreshSession = async () => {
  const csrfToken = getCsrfToken();
  const response = await axios.post<IRefreshSessionResponse>(
    `${webEnvironment.apiUrl}/auth/refresh-token`,
    {},
    {
      withCredentials: true,
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
    }
  );
  const accessToken = response.data.data?.accessToken;
  const user = response.data.data?.user;

  if (!accessToken || !user) {
    throw new Error('Session refresh succeeded without complete session data');
  }

  useAuthStore.getState().setAccessToken(accessToken);
  useAuthStore.getState().setUser(user);
  return { accessToken, user };
};

const requestWithCrossTabLock = () => {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('imminiq-auth-session-refresh', requestFreshSession);
  }

  return requestFreshSession();
};

/** Share one refresh across startup, concurrent API failures, and React Strict Mode. */
export const refreshAuthSession = () => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = requestWithCrossTabLock().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};
