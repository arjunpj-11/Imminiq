import { keepPreviousData, useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import {
  ADMIN_USERS_ENDPOINTS,
  ADMIN_USERS_STALE_TIME_MS,
} from '../constants/admin-users.constants';
import type { AdminUsersData } from '../types/admin-users.types';
import { adminUsersKeys, type AdminUsersQuery } from './admin-users.query-keys';
import type { ApiEnvelope } from '../../../../lib/api.types';

export const useAdminUsers = (query: AdminUsersQuery) =>
  useQuery({
    queryKey: adminUsersKeys.list(query),
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminUsersData>>(ADMIN_USERS_ENDPOINTS.list, { params: query }))
        .data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_USERS_STALE_TIME_MS,
  });
