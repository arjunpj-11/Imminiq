import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../admin-api.types';
import type { AdminAuditLog } from '../types/admin-audit-logs.types';
export const useAdminAuditLogs = (query: AdminListQuery) =>
  useQuery({
    queryKey: ['admin', 'audit-logs', query],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminAuditLog>>>('/admin/audit-logs', {
          params: query,
        })
      ).data.data,
    placeholderData: keepPreviousData,
  });
