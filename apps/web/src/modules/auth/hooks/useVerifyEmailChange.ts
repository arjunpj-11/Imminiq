import { useMutation } from '@tanstack/react-query';

import api from '../../../lib/axios';
import { AUTH_API_PATHS } from '../constants/auth.constants';

export const useVerifyEmailChange = () =>
  useMutation({
    mutationFn: async (token: string) => {
      await api.post(AUTH_API_PATHS.verifyEmailChange, { token });
    },
  });
