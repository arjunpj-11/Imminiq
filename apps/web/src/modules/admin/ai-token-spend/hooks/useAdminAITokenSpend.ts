import { useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../shared';
import type { AdminAITokenSpend } from '../types/admin-ai-token-spend.types';
import { adminAITokenSpendKeys } from './admin-ai-token-spend.query-keys';

export const useAdminAITokenSpend = (range: { from: string; to: string }) =>
  useQuery({
    queryKey: adminAITokenSpendKeys.range(range),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminAITokenSpend>>('/admin/ai-token-spend', {
          params: range,
        })
      ).data.data,
  });
