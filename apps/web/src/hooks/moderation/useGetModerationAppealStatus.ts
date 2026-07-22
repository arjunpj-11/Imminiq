import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import api from '../../lib/axios';
import { getBlockedAppealToken } from '../../lib/blockedAppealSession';
import type {
  IModerationAppealApiErrorResponse,
  IModerationAppealStatus,
} from './useSubmitModerationAppeal';
import { MODERATION_APPEAL_ENDPOINTS } from './moderation.constants';
import { moderationKeys } from './moderation.query-keys';

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
    queryKey: moderationKeys.accountStatus(identifier),

    enabled: Boolean(identifier.trim() && getBlockedAppealToken()),

    queryFn: async () => {
      const response = await api.post<IGetModerationAppealStatusResponse>(
        MODERATION_APPEAL_ENDPOINTS.accountStatus,
        {},
        { headers: { Authorization: `Bearer ${getBlockedAppealToken()}` } }
      );

      return response.data;
    },

    retry: false,
    refetchOnWindowFocus: false,
  });
};
