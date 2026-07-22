import { useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { ADMIN_USERS_ENDPOINTS } from '../constants/admin-users.constants';
import type { AdminUserNotesData } from '../types/admin-users.types';
import { adminUsersKeys } from './admin-users.query-keys';

export const useAdminUserNotes = (userId: string) =>
  useQuery({
    queryKey: adminUsersKeys.notes(userId),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminUserNotesData>>(
          ADMIN_USERS_ENDPOINTS.notes(userId),
        )
      ).data.data,
    enabled: Boolean(userId),
  });
