import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { ADMIN_CONTENT_APPEALS_ENDPOINTS } from '../../config/admin-shared.constants';
import api from '../../lib/axios';
import type { ApiEnvelope } from '../../lib/api.types';
import { adminSharedKeys, type AdminContentKind } from './admin-shared.query-keys';
import type { AdminContentAppealsData } from './admin-shared.types';

export const useAdminContentAppeals = (kind: AdminContentKind, status: string, page: number) =>
  useQuery({
    queryKey: adminSharedKeys.contentAppealList(kind, status, page),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminContentAppealsData>>(
          ADMIN_CONTENT_APPEALS_ENDPOINTS.list(kind),
          { params: { status, page } }
        )
      ).data.data,
    placeholderData: keepPreviousData,
  });
