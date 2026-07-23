import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import type { AdminPrivacyRequestsData } from '../types/admin-users.types';
import { adminUsersKeys, type AdminPrivacyRequestsQuery } from './admin-users.query-keys';

export const useAdminPrivacyRequests = (query: AdminPrivacyRequestsQuery) =>
  useQuery({
    queryKey: adminUsersKeys.privacyRequestList(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPrivacyRequestsData>>(
          ADMIN_USERS_ENDPOINTS.privacyRequests,
          { params: query }
        )
      ).data.data,
    placeholderData: keepPreviousData,
  });
