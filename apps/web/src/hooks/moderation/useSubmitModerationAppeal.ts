import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../lib/axios';
import { getBlockedAppealToken } from '../../lib/blockedAppealSession';

export interface ISubmitModerationAppealPayload {
  appealReason: string;
}

export interface IModerationAppealStatus {
  caseId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  appealReason?: string;
}

export interface ISubmitModerationAppealResponse {
  success: boolean;
  message: string;
  data?: IModerationAppealStatus;
}

export interface IModerationAppealApiErrorResponse {
  success?: boolean;
  message?: string;
  code?: string;
}

export const useSubmitModerationAppeal = () => {
  return useMutation<
    ISubmitModerationAppealResponse,
    AxiosError<IModerationAppealApiErrorResponse>,
    ISubmitModerationAppealPayload
  >({
    mutationFn: async (payload) => {
      const response = await api.post<ISubmitModerationAppealResponse>(
        '/moderation-appeals',
        payload,
        { headers: { Authorization: `Bearer ${getBlockedAppealToken()}` } }
      );

      return response.data;
    },
  });
};
