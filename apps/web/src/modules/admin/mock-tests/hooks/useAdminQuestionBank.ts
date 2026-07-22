import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminPageData } from "../../../../components/admin";
import { ADMIN_MOCK_TESTS_ENDPOINTS } from "../constants/admin-mock-tests.constants";
import type { AdminQuestionBankItem } from "../types/admin-mock-tests.types";
import { adminMockTestsKeys } from "./admin-mock-tests.query-keys";

export type AdminQuestionBankQuery = {
  search?: string;
  topic?: string;
  type?: string;
  difficulty?: string;
  page: number;
};

export const useAdminQuestionBank = (query: AdminQuestionBankQuery) =>
  useQuery({
    queryKey: adminMockTestsKeys.questionBank(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminQuestionBankItem>>>(
          ADMIN_MOCK_TESTS_ENDPOINTS.questionBank,
          { params: query },
        )
      ).data.data,
    placeholderData: keepPreviousData,
  });
