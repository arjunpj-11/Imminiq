import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import { toast } from "../../../../lib/toast";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import { ADMIN_MOCK_TESTS_ENDPOINTS } from "../constants/admin-mock-tests.constants";
import { adminMockTestsKeys } from "./admin-mock-tests.query-keys";
export const useRestoreAdminMockTestQuestionVersion = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      version,
      reason,
      actionPassword,
    }: {
      questionId: string;
      version: number;
      reason: string;
      actionPassword?: string;
    }) =>
      api.post(
        ADMIN_MOCK_TESTS_ENDPOINTS.restoreQuestionVersion(questionId, version),
        { reason },
        { headers: actionPassword ? { "X-Admin-Action-Password": actionPassword } : undefined },
      ),
    onSuccess: async () => {
      toast.success(
        "Question restored",
        "A new version was created from the selected snapshot.",
      );
      await client.invalidateQueries({ queryKey: adminMockTestsKeys.all });
    },
    onError: (error) =>
      toast.error("Version restore failed", getUserFacingError(error)),
  });
};
