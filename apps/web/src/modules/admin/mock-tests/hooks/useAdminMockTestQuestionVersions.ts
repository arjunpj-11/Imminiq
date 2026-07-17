import { useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import { ADMIN_MOCK_TESTS_ENDPOINTS } from "../constants/admin-mock-tests.constants";
import type { AdminMockTestQuestionVersion } from "../types/admin-mock-tests.types";
import { adminMockTestsKeys } from "./admin-mock-tests.query-keys";

export const useAdminMockTestQuestionVersions = (questionId?: string) =>
  useQuery({
    queryKey: adminMockTestsKeys.versions(questionId),
    enabled: Boolean(questionId),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminMockTestQuestionVersion[]>>(
          ADMIN_MOCK_TESTS_ENDPOINTS.questionVersions(questionId ?? ""),
        )
      ).data.data,
  });
