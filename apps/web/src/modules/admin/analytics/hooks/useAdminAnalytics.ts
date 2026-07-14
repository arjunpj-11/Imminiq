import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../shared';
import type { AdminAnalytics } from '../types/admin-analytics.types';
import { adminAnalyticsKeys } from './admin-analytics.query-keys';
export const useAdminAnalytics = (range: { from: string; to: string }) =>
  useQuery({
    queryKey: adminAnalyticsKeys.range(range),
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminAnalytics>>('/admin/analytics', { params: range })).data
        .data,
  });
