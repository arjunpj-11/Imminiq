import { useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../shared';
import type { AdminAITokenSpend } from '../types/admin-ai-token-spend.types';

export const useAdminAITokenSpend = (range: { from: string; to: string }) =>
  useQuery({
    queryKey: ['admin', 'ai-token-spend', range],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminAITokenSpend>>('/admin/ai-token-spend', {
          params: range,
        })
      ).data.data,
  });
