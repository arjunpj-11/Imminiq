import { useEffect } from 'react';
import type { AxiosError } from 'axios';
import api from '../../lib/axios';
import {
  clearBlockedAppealIdentifier,
  saveBlockedAppealIdentifier,
} from '../../lib/blockedAppealSession';
import { useAuthStore, type IAuthUser } from '../../store/useAuthStore';

interface IRefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
  };
}

interface IMeResponse {
  success: boolean;
  message: string;
  data?: {
    user?: IAuthUser;
  };
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

const isRestrictedAccountCode = (code?: string) => {
  return (
    code === 'ACCOUNT_BLOCKED' ||
    code === 'ACCOUNT_BANNED' ||
    code === 'ACCOUNT_DEACTIVATED' ||
    code === 'ACCOUNT_PAUSED'
  );
};

const isRestrictedStatus = (status?: IAuthUser['status']) => {
  return (
    status === 'blocked' || status === 'banned' || status === 'deactivated' || status === 'paused'
  );
};

export const useRestoreSession = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setAuthReady = useAuthStore((state) => state.setAuthReady);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshResponse = await api.post<IRefreshTokenResponse>('/auth/refresh-token');

        const accessToken = refreshResponse.data.data?.accessToken;

        if (!accessToken) {
          clearAuth();
          return;
        }

        setAccessToken(accessToken);

        const meResponse = await api.get<IMeResponse>('/auth/me');
        const user = meResponse.data.data?.user;

        if (!user) {
          clearAuth();
          return;
        }

        if (isRestrictedStatus(user.status)) {
          const restrictedIdentifier = user.email || user.phone || '';

          if (restrictedIdentifier) {
            saveBlockedAppealIdentifier(restrictedIdentifier);
          }

          clearAuth();

          if (window.location.pathname !== '/blocked') {
            window.location.replace('/blocked');
          }

          return;
        }

        // Active restored users must not keep old restricted-account context.
        clearBlockedAppealIdentifier();
        setUser(user);
      } catch (error) {
        const axiosError = error as AxiosError<IApiErrorResponse>;
        const errorCode = axiosError.response?.data?.code;

        clearAuth();

        if (isRestrictedAccountCode(errorCode)) {
          if (window.location.pathname !== '/blocked') {
            window.location.replace('/blocked');
          }

          return;
        }
      } finally {
        setAuthReady(true);
      }
    };

    restoreSession();
  }, [clearAuth, setAccessToken, setAuthReady, setUser]);
};
