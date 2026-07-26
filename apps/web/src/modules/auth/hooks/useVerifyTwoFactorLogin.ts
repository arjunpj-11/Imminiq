import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import type { AxiosError } from 'axios';
import api from '../../../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import { ADMIN_ROUTES, ROUTES } from '../../../routes/config/route-paths';
import { AUTH_API_PATHS } from '../constants/auth.constants';
import { isStaffRole } from '../../../lib/auth-roles';
import type { IAuthUser } from '../../../store/useAuthStore';
import { reportClientError } from '../../../lib/telemetry/client-error-reporter';

interface IVerifyTwoFactorLoginPayload {
  code: string;
}

interface IUser {
  _id: string;
  fullName?: string;
  username: string;
  email?: string;
  phone?: string;
  role: IAuthUser['role'];
  isPremium?: boolean;
  avatarUrl?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  onboardingCompleted?: boolean;
}

type LoginRedirectPath =
  typeof ROUTES.dashboard | typeof ROUTES.trackerCreate | typeof ADMIN_ROUTES.dashboard;

interface IVerifyTwoFactorLoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
    user?: IUser;
    redirectPath?: LoginRedirectPath;
  };
}

interface IApiErrorResponse {
  success?: boolean;
  message?: string;
}

export const useVerifyTwoFactorLogin = () => {
  const navigate = useNavigate();

  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation<
    IVerifyTwoFactorLoginResponse,
    AxiosError<IApiErrorResponse>,
    IVerifyTwoFactorLoginPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<IVerifyTwoFactorLoginResponse>(
        AUTH_API_PATHS.verifyTwoFactorLogin,
        payload
      );

      return response.data;
    },

    onSuccess: (response) => {
      const user = response.data?.user;
      const accessToken = response.data?.accessToken;
      const redirectPath = isStaffRole(user?.role)
        ? ADMIN_ROUTES.dashboard
        : response.data?.redirectPath || ROUTES.dashboard;

      if (!user) {
        reportClientError('Two-factor verification succeeded without a user payload.', {
          source: 'invariant',
        });
        return;
      }

      if (!accessToken) {
        reportClientError('Two-factor verification succeeded without an access token.', {
          source: 'invariant',
        });
        return;
      }

      setUser(user);
      setAccessToken(accessToken);

      navigate(redirectPath, {
        replace: true,
      });
    },
  });
};
