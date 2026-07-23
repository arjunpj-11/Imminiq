import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminListQuery, AdminPageData } from '../../../../components/admin';
import type { ApiEnvelope } from '../../../../lib/api.types';
import type { AdminSupportTicket } from '../types/admin-support-tickets.types';
import { adminSupportTicketsKeys } from './admin-support-tickets.query-keys';
import {
  ADMIN_SUPPORT_TICKETS_ENDPOINTS,
  ADMIN_SUPPORT_TICKETS_STALE_TIME_MS,
} from '../constants/admin-support-tickets.constants';
export const useAdminSupportTickets = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminSupportTicketsKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminSupportTicket>>>(
          ADMIN_SUPPORT_TICKETS_ENDPOINTS.list,
          {
            params: query,
          }
        )
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_SUPPORT_TICKETS_STALE_TIME_MS,
  });
