import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminPageData, ApiEnvelope } from '../../shared';
import type { AdminBroadcast } from '../types/admin-broadcast.types';
import { adminBroadcastKeys } from './admin-broadcast.query-keys';
import {
  ADMIN_BROADCAST_ENDPOINTS,
  ADMIN_BROADCAST_PAGE_SIZE,
  ADMIN_BROADCAST_STALE_TIME_MS,
} from '../constants/admin-broadcast.constants';
export const useAdminBroadcasts = (page: number) =>
  useQuery({
    queryKey: adminBroadcastKeys.list(page),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminBroadcast>>>(ADMIN_BROADCAST_ENDPOINTS.list, {
          params: { page, limit: ADMIN_BROADCAST_PAGE_SIZE },
        })
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_BROADCAST_STALE_TIME_MS,
  });
