import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../admin-api.types';
import type { AdminAnalytics } from '../types/admin-analytics.types';
export const useAdminAnalytics = (days: number) =>
  useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminAnalytics>>('/admin/analytics', { params: { days } })).data
        .data,
  });
