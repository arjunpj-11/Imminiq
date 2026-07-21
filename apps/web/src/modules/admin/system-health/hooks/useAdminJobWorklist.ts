import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminPageData } from "../../../../components/admin";
import { ADMIN_SYSTEM_HEALTH_ENDPOINTS } from "../constants/admin-system-health.constants";
import type { AdminBackgroundJob } from "../types/admin-system-health.types";
import { adminSystemHealthKeys } from "./admin-system-health.query-keys";

export type AdminJobQuery = { queue: string; status: string; page: number };

export const useAdminJobWorklist = (query: AdminJobQuery) =>
  useQuery({
    queryKey: adminSystemHealthKeys.jobs(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminBackgroundJob>>>(
          ADMIN_SYSTEM_HEALTH_ENDPOINTS.jobs,
          { params: query },
        )
      ).data.data,
    placeholderData: keepPreviousData,
    refetchInterval: 10_000,
  });

export const useAdminJobAction = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      queue: string;
      jobId: string;
      action: "cancel" | "retry" | "remove";
      actionPassword: string;
    }) =>
      api.patch(
        ADMIN_SYSTEM_HEALTH_ENDPOINTS.job(input.queue, input.jobId),
        { action: input.action },
        {
          headers: input.actionPassword
            ? { "X-Admin-Action-Password": input.actionPassword }
            : undefined,
        },
      ),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: adminSystemHealthKeys.all });
    },
  });
};
