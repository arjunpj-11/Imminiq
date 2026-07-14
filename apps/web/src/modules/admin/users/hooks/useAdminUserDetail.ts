import { useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import {
  ADMIN_USERS_ENDPOINTS,
  ADMIN_USERS_STALE_TIME_MS,
} from '../constants/admin-users.constants';
import type { AdminUserDetailData } from '../types/admin-users.types';
import { adminUsersKeys } from './admin-users.query-keys';
import type { ApiEnvelope } from '../../../../lib/api.types';

export const useAdminUserDetail = (userId: string) =>
  useQuery({
    queryKey: adminUsersKeys.detail(userId),
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminUserDetailData>>(ADMIN_USERS_ENDPOINTS.detail(userId))).data.data,
    enabled: Boolean(userId),
    staleTime: ADMIN_USERS_STALE_TIME_MS,
  });
