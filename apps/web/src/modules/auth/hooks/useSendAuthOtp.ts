import { useMutation } from '@tanstack/react-query';

import api from '../../../lib/axios';
import { AUTH_API_PATHS } from '../constants/auth.constants';
import type { VerifyPurpose } from '../types/auth.types';

interface ISendAuthOtpPayload {
  identifier: string;
  method?: 'email' | 'phone';
  purpose: VerifyPurpose;
}

export const useSendAuthOtp = () =>
  useMutation({
    mutationFn: async (payload: ISendAuthOtpPayload) => {
      await api.post(AUTH_API_PATHS.sendOtp, payload);
    },
  });
