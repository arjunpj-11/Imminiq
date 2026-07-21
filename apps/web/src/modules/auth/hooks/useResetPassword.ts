import { useMutation } from '@tanstack/react-query';

import api from '../../../lib/axios';
import { AUTH_API_PATHS } from '../constants/auth.constants';

export interface IResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export const useResetPassword = () =>
  useMutation({
    mutationFn: async (payload: IResetPasswordPayload) => {
      await api.post(AUTH_API_PATHS.resetPassword, payload);
    },
  });
