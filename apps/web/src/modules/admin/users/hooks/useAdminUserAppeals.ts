import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { ADMIN_USERS_ENDPOINTS, ADMIN_USERS_STALE_TIME_MS } from '../constants/admin-users.constants';
import type { AdminUserAppealsData } from '../types/admin-users.types';
import { adminUsersKeys, type AdminUserAppealsQuery } from './admin-users.query-keys';

export const useAdminUserAppeals = (query: AdminUserAppealsQuery) =>
  useQuery({
    queryKey: adminUsersKeys.appealList(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminUserAppealsData>>(ADMIN_USERS_ENDPOINTS.appeals, {
          params: query,
        })
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_USERS_STALE_TIME_MS,
  });
