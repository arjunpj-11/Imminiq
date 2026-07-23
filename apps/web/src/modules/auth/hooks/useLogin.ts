import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import api from '../../../lib/axios';
import { useAuthStore, type IAuthUser } from '../store/useAuthStore';
import {
  clearBlockedAppealIdentifier,
  saveBlockedAppealIdentifier,
  saveBlockedAppealToken,
  saveBlockedModerationMessage,
} from '../../../lib/blockedAppealSession';
import { ADMIN_ROUTES, ROUTES } from '../../../routes/config/route-paths';
import { AUTH_API_PATHS } from '../constants/auth.constants';
import { isStaffRole } from '../../../lib/auth-roles';
import { resetClientState } from '../../../store/reset-client-state';

interface ILoginPayload {
  identifier: string;
  password: string;
}

type LoginRedirectPath =
  | typeof ROUTES.dashboard
  | typeof ROUTES.trackerCreate
  | typeof ADMIN_ROUTES.dashboard;

interface IStandardLoginData {
  accessToken?: string;
  user?: IAuthUser;
  redirectPath?: LoginRedirectPath;
  requiresTwoFactor?: false;
}

interface ITwoFactorRequiredLoginData {
  requiresTwoFactor: true;
  challengeExpiresInMinutes?: number;
}

type LoginResponseData = IStandardLoginData | ITwoFactorRequiredLoginData;

interface ILoginResponse {
  success: boolean;
  message: string;
  data?: LoginResponseData;
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
  data?: { appealToken?: string };
}

const isTwoFactorRequired = (
  data: LoginResponseData | undefined
): data is ITwoFactorRequiredLoginData => {
  return !!data && data.requiresTwoFactor === true;
};

const isRestrictedAccountCode = (code?: string) => {
  return (
    code === 'ACCOUNT_BLOCKED' ||
    code === 'ACCOUNT_BANNED' ||
    code === 'ACCOUNT_DEACTIVATED' ||
    code === 'ACCOUNT_PAUSED'
  );
};

export const useLogin = () => {
  const navigate = useNavigate();

  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation<ILoginResponse, AxiosError<IApiErrorResponse>, ILoginPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<ILoginResponse>(AUTH_API_PATHS.login, payload);

      return response.data;
    },

    onSuccess: (response) => {
      const data = response.data;

      if (isTwoFactorRequired(data)) {
        navigate(ROUTES.twoFactorChallenge, {
          replace: true,
        });

        return;
      }

      const user = data?.user;
      const accessToken = data?.accessToken;
      const redirectPath = isStaffRole(user?.role)
        ? ADMIN_ROUTES.dashboard
        : data?.redirectPath || ROUTES.dashboard;

      if (!user) {
        console.error('Login succeeded, but user was not returned from backend.');
        return;
      }

      if (!accessToken) {
        console.error('Login succeeded, but access token was not returned from backend.');
        return;
      }

      clearBlockedAppealIdentifier();

      setUser(user);
      setAccessToken(accessToken);

      navigate(redirectPath, {
        replace: true,
      });
    },

    onError: (error, payload) => {
      const errorCode = error.response?.data?.code;

      if (isRestrictedAccountCode(errorCode)) {
        const appealToken = error.response?.data?.data?.appealToken;

        if (!appealToken) return;

        resetClientState();
        saveBlockedAppealIdentifier(payload.identifier);
        saveBlockedAppealToken(appealToken);
        saveBlockedModerationMessage(
          error.response?.data?.message || 'Your account access is currently restricted.'
        );

        navigate(ROUTES.blocked, {
          replace: true,
        });

        return;
      }

      console.error(error.response?.data?.message || 'Login failed. Please try again.');
    },
  });
};
