import { useMutation } from '@tanstack/react-query';

import api from '../../../lib/axios';
import { AUTH_API_PATHS } from '../constants/auth.constants';

interface IVerifyResetCodePayload {
  identifier: string;
  otp: string;
}

interface IVerifyResetCodeResponse {
  data?: {
    resetToken?: string;
  };
}

export const useVerifyResetCode = () =>
  useMutation({
    mutationFn: async (payload: IVerifyResetCodePayload) => {
      const response = await api.post<IVerifyResetCodeResponse>(
        AUTH_API_PATHS.verifyResetCode,
        payload,
      );
      const resetToken = response.data.data?.resetToken;
      if (!resetToken) throw new Error('Reset token was not returned');
      return resetToken;
    },
  });
