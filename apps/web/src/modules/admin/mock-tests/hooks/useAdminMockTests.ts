import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminListQuery, AdminPageData, ApiEnvelope } from '../../shared';
import type { AdminMockTest, AdminMockTestDetail } from '../types/admin-mock-tests.types';
export const useAdminMockTests = (query: AdminListQuery) =>
  useQuery({
    queryKey: ['admin', 'mock-tests', query],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminMockTest>>>('/admin/mock-tests', {
          params: query,
        })
      ).data.data,
    placeholderData: keepPreviousData,
  });
export const useAdminMockTestDetail = (id?: string) =>
  useQuery({
    queryKey: ['admin', 'mock-tests', 'detail', id],
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminMockTestDetail>>(`/admin/mock-tests/${id}`)).data.data,
    enabled: Boolean(id),
  });
