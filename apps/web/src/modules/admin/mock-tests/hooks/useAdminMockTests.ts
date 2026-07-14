import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { AdminListQuery, AdminPageData } from '../../shared';
import type { ApiEnvelope } from '../../../../lib/api.types';
import type { AdminMockTest } from '../types/admin-mock-tests.types';
import { adminMockTestsKeys } from './admin-mock-tests.query-keys';
import {
  ADMIN_MOCK_TESTS_ENDPOINTS,
  ADMIN_MOCK_TESTS_STALE_TIME_MS,
} from '../constants/admin-mock-tests.constants';
export const useAdminMockTests = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminMockTestsKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminMockTest>>>(ADMIN_MOCK_TESTS_ENDPOINTS.list, {
          params: query,
        })
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_MOCK_TESTS_STALE_TIME_MS,
  });
