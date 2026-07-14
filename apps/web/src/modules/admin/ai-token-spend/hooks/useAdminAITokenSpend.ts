import { useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import type { AdminAITokenSpend } from '../types/admin-ai-token-spend.types';
import { adminAITokenSpendKeys } from './admin-ai-token-spend.query-keys';
import {
  ADMIN_AI_TOKEN_SPEND_ENDPOINTS,
  ADMIN_AI_TOKEN_SPEND_STALE_TIME_MS,
} from '../constants/admin-ai-token-spend.constants';

export const useAdminAITokenSpend = (range: { from: string; to: string }) =>
  useQuery({
    queryKey: adminAITokenSpendKeys.range(range),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminAITokenSpend>>(ADMIN_AI_TOKEN_SPEND_ENDPOINTS.overview, {
          params: range,
        })
      ).data.data,
    staleTime: ADMIN_AI_TOKEN_SPEND_STALE_TIME_MS,
  });
