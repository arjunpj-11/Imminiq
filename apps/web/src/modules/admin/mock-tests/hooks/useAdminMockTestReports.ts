import { keepPreviousData, useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import type { AdminListQuery, AdminPageData } from '../../shared';
import { ADMIN_MOCK_TESTS_ENDPOINTS } from '../constants/admin-mock-tests.constants';
import type { AdminMockTestQuestionIssue } from '../types/admin-mock-tests.types';
import { adminMockTestsKeys } from './admin-mock-tests.query-keys';

export const useAdminMockTestReports = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminMockTestsKeys.reportList(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminMockTestQuestionIssue>>>(
          ADMIN_MOCK_TESTS_ENDPOINTS.reports,
          { params: query }
        )
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
