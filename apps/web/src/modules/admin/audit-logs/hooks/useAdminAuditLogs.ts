import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import type { AdminListQuery, AdminPageData } from "../../../../components/admin";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminAuditLog } from "../types/admin-audit-logs.types";
import { adminAuditLogsKeys } from "./admin-audit-logs.query-keys";
import {
  ADMIN_AUDIT_LOGS_ENDPOINTS,
  ADMIN_AUDIT_LOGS_STALE_TIME_MS,
} from "../constants/admin-audit-logs.constants";
export const useAdminAuditLogs = (query: AdminListQuery) =>
  useQuery({
    queryKey: adminAuditLogsKeys.list(query),
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<AdminPageData<AdminAuditLog>>>(
          ADMIN_AUDIT_LOGS_ENDPOINTS.list,
          {
            params: query,
          },
        )
      ).data.data,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_AUDIT_LOGS_STALE_TIME_MS,
  });
