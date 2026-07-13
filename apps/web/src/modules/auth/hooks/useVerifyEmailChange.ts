import { useMutation } from '@tanstack/react-query';

import api from '../../../lib/axios';

export const useVerifyEmailChange = () =>
  useMutation({
    mutationFn: async (token: string) => {
      await api.post('/security/verify-email-change', { token });
    },
  });
