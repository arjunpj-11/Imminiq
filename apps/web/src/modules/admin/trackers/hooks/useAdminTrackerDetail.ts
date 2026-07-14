import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import type { AdminTrackerDetail } from '../types/admin-trackers.types';
import { ADMIN_TRACKERS_ENDPOINTS, ADMIN_TRACKERS_STALE_TIME_MS } from '../constants/admin-trackers.constants';
import { adminTrackersKeys } from './admin-trackers.query-keys';

export const useAdminTrackerDetail = (id?: string) =>
  useQuery({
    queryKey: adminTrackersKeys.detail(id),
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminTrackerDetail>>(ADMIN_TRACKERS_ENDPOINTS.detail(id!))).data.data,
    enabled: Boolean(id),
    staleTime: ADMIN_TRACKERS_STALE_TIME_MS,
  });
