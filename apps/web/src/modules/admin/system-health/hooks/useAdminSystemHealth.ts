import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../shared';
import type { AdminSystemHealth } from '../types/admin-system-health.types';
import { adminSystemHealthKeys } from './admin-system-health.query-keys';
import {
  ADMIN_SYSTEM_HEALTH_ENDPOINTS,
  ADMIN_SYSTEM_HEALTH_REFETCH_INTERVAL_MS,
} from '../constants/admin-system-health.constants';
export const useAdminSystemHealth = () =>
  useQuery({
    queryKey: adminSystemHealthKeys.status(),
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminSystemHealth>>(ADMIN_SYSTEM_HEALTH_ENDPOINTS.overview)).data.data,
    refetchInterval: ADMIN_SYSTEM_HEALTH_REFETCH_INTERVAL_MS,
  });
