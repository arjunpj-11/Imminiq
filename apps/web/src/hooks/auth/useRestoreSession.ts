import { useEffect } from 'react';
import type { AxiosError } from 'axios';
import { refreshAuthSession } from '../../lib/auth-session-refresh';
import {
  clearBlockedAppealIdentifier,
  saveBlockedAppealIdentifier,
} from '../../lib/blockedAppealSession';
import { resetClientState } from '../../store/reset-client-state';
import { useAuthStore, type IAuthUser } from '../../store/useAuthStore';
import { ROUTES } from '../../routes/config/route-paths';

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
  const setAuthReady = useAuthStore((state) => state.setAuthReady);

  useEffect(() => {
    const currentSession = useAuthStore.getState();
    if (currentSession.authReady && currentSession.user && currentSession.accessToken) return;

    const restoreSession = async () => {
      try {
        const { user } = await refreshAuthSession();

        if (isRestrictedStatus(user.status)) {
          const restrictedIdentifier = user.email || user.phone || '';

          if (restrictedIdentifier) {
            saveBlockedAppealIdentifier(restrictedIdentifier);
          }

          resetClientState();

          if (window.location.pathname !== ROUTES.blocked) {
            window.location.replace(ROUTES.blocked);
          }

          return;
        }

        // Active restored users must not keep old restricted-account context.
        clearBlockedAppealIdentifier();
      } catch (error) {
        const axiosError = error as AxiosError<IApiErrorResponse>;
        const errorCode = axiosError.response?.data?.code;

        resetClientState();

        if (isRestrictedAccountCode(errorCode)) {
          if (window.location.pathname !== ROUTES.blocked) {
            window.location.replace(ROUTES.blocked);
          }

          return;
        }
      } finally {
        setAuthReady(true);
      }
    };

    restoreSession();
  }, [setAuthReady]);
};
