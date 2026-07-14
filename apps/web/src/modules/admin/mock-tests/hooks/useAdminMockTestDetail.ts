import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import type { AdminMockTestDetail } from '../types/admin-mock-tests.types';
import { adminMockTestsKeys } from './admin-mock-tests.query-keys';
import {
  ADMIN_MOCK_TESTS_ENDPOINTS,
  ADMIN_MOCK_TESTS_STALE_TIME_MS,
} from '../constants/admin-mock-tests.constants';

export const useAdminMockTestDetail = (id?: string) =>
  useQuery({
    queryKey: adminMockTestsKeys.detail(id),
    queryFn: async () =>
      (await api.get<ApiEnvelope<AdminMockTestDetail>>(ADMIN_MOCK_TESTS_ENDPOINTS.detail(id!))).data
        .data,
    enabled: Boolean(id),
    staleTime: ADMIN_MOCK_TESTS_STALE_TIME_MS,
  });
