import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../admin-api.types';
import type { AdminSystemHealth } from '../types/admin-system-health.types';
export const useAdminSystemHealth = () =>
  useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminSystemHealth>>('/admin/system-health')).data.data,
    refetchInterval: 15000,
  });
