import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import { ADMIN_MOCK_TESTS_ENDPOINTS } from "../constants/admin-mock-tests.constants";
import { adminMockTestsKeys } from "./admin-mock-tests.query-keys";

type DeleteQuestionBankResult = {
  bankId: number;
  removedFromTests: number;
  affectedTests: number;
};

export const useDeleteAdminQuestionBankItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { bankId: number; reason: string; actionPassword: string }) =>
      (
        await api.delete<ApiEnvelope<DeleteQuestionBankResult>>(
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
