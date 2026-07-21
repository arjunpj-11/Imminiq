import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminPageData } from "../../../../components/admin";
import { ADMIN_MOCK_TESTS_ENDPOINTS } from "../constants/admin-mock-tests.constants";
import type {
  AdminQuestionBankDetail,
  AdminQuestionBankItem,
} from "../types/admin-mock-tests.types";
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

export const useAdminQuestionBankItem = (bankId?: number) =>
  useQuery({
    queryKey: [...adminMockTestsKeys.all, "question-bank-item", bankId] as const,
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminQuestionBankDetail>>(
          ADMIN_MOCK_TESTS_ENDPOINTS.questionBankItem(bankId!),
        )
      ).data.data,
    enabled: bankId != null,
  });

export const useDeleteAdminQuestionBankItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { bankId: number; reason: string; actionPassword: string }) =>
      (
        await api.delete<ApiEnvelope<{ bankId: number; removedFromTests: number; affectedTests: number }>>(
          ADMIN_MOCK_TESTS_ENDPOINTS.questionBankItem(input.bankId),
          {
            data: { reason: input.reason },
            headers: input.actionPassword
              ? { "X-Admin-Action-Password": input.actionPassword }
              : undefined,
          },
        )
      ).data.data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminMockTestsKeys.all });
    },
  });
};

export const useRestoreAdminQuestionBankItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      bankId: number;
      reason: string;
      actionPassword: string;
    }) =>
      (
        await api.patch<
          ApiEnvelope<{ bankId: number; restoredInTests: number; affectedTests: number }>
        >(
          ADMIN_MOCK_TESTS_ENDPOINTS.restoreQuestionBankItem(input.bankId),
          { reason: input.reason },
          {
            headers: input.actionPassword
              ? { "X-Admin-Action-Password": input.actionPassword }
              : undefined,
          },
        )
      ).data.data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminMockTestsKeys.all });
    },
  });
};
