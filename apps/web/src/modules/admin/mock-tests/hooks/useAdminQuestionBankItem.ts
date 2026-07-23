import { useQuery } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { ADMIN_MOCK_TESTS_ENDPOINTS } from '../constants/admin-mock-tests.constants';
import type { AdminQuestionBankDetail } from '../types/admin-mock-tests.types';
import { adminMockTestsKeys } from './admin-mock-tests.query-keys';

export const useAdminQuestionBankItem = (bankId?: number) =>
  useQuery({
    queryKey: adminMockTestsKeys.questionBankItem(bankId),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminQuestionBankDetail>>(
          ADMIN_MOCK_TESTS_ENDPOINTS.questionBankItem(bankId!)
        )
      ).data.data,
    enabled: bankId != null,
  });
