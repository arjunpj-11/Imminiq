import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../shared';
import type { AdminAuditLog } from '../types/admin-audit-logs.types';
import { adminAuditLogsKeys } from './admin-audit-logs.query-keys';
export const useAdminAuditLogs = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminAuditLogsKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminAuditLog>>>('/admin/audit-logs', {
          params: query,
        })
      ).data.data,
    placeholderData: keepPreviousData,
  });

export const useExportAdminAuditLogs = () =>
  useMutation({
    mutationFn: async (query: Pick<AdminListQuery, 'search' | 'status' | 'from' | 'to'>) => {
      const items: AdminAuditLog[] = [];
      let page = 1;
      while (true) {
        const result = (
          await api.get<ApiEnvelope<AdminPageData<AdminAuditLog>>>('/admin/audit-logs', {
            params: { ...query, page, limit: 100 },
          })
        ).data.data;
        items.push(...result.items);
        if (!result.items.length || page >= result.pagination.pages) break;
        page += 1;
      }
      return items;
    },
  });
