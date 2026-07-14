import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../shared';
import type { AdminSystemHealth } from '../types/admin-system-health.types';
import { adminSystemHealthKeys } from './admin-system-health.query-keys';
export const useAdminSystemHealth = () =>
  useQuery({
    queryKey: adminSystemHealthKeys.status(),
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminSystemHealth>>('/admin/system-health')).data.data,
    refetchInterval: 15000,
  });
