import { useMutation } from '@tanstack/react-query';

import api from '../../../lib/axios';
import { AUTH_API_PATHS } from '../constants/auth.constants';

interface IVerifyCodePayload {
  identifier: string;
  otp: string;
}

export const useVerifyAccount = () =>
  useMutation({
    mutationFn: async (payload: IVerifyCodePayload) => {
      await api.post(AUTH_API_PATHS.verifyAccount, payload);
    },
  });
