import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../lib/axios';
import { getBlockedAppealToken } from '../../lib/blockedAppealSession';
import type {
  IModerationAppealApiErrorResponse,
  IModerationAppealStatus,
} from './useSubmitModerationAppeal';

export interface IGetModerationAppealStatusResponse {
  success: boolean;
  message: string;
  data?: {
    exists: boolean;
    appeal: IModerationAppealStatus | null;
  };
}

export const useGetModerationAppealStatus = (identifier: string) => {
  return useQuery<
    IGetModerationAppealStatusResponse,
    AxiosError<IModerationAppealApiErrorResponse>
  >({
    queryKey: ['moderation-appeal-status', identifier],

    enabled: Boolean(identifier.trim() && getBlockedAppealToken()),

    queryFn: async () => {
      const response = await api.post<IGetModerationAppealStatusResponse>(
        '/moderation-appeals/status',
        {},
        { headers: { Authorization: `Bearer ${getBlockedAppealToken()}` } }
      );

      return response.data;
    },

    retry: false,
    refetchOnWindowFocus: false,
  });
};
