import { useMutation } from "@tanstack/react-query";
import api from "../../../../lib/axios";
import { toast } from "../../../../lib/toast";
import type { AdminListQuery, AdminPageData } from "../../shared";
import type { ApiEnvelope } from "../../../../lib/api.types";
import type { AdminAuditLog } from "../types/admin-audit-logs.types";
import {
  ADMIN_AUDIT_LOGS_ENDPOINTS,
  ADMIN_AUDIT_LOGS_EXPORT_PAGE_SIZE,
} from "../constants/admin-audit-logs.constants";

export const useExportAdminAuditLogs = () =>
  useMutation({
    mutationFn: async (
      query: Pick<AdminListQuery, "search" | "status" | "from" | "to">,
    ) => {
      const items: AdminAuditLog[] = [];
      let page = 1;
      while (true) {
        const result = (
          await api.get<ApiEnvelope<AdminPageData<AdminAuditLog>>>(
            ADMIN_AUDIT_LOGS_ENDPOINTS.list,
            {
              params: {
                ...query,
                page,
                limit: ADMIN_AUDIT_LOGS_EXPORT_PAGE_SIZE,
              },
            },
          )
        ).data.data;
        items.push(...result.items);
        if (!result.items.length || page >= result.pagination.pages) break;
        page += 1;
      }
      return items;
    },
    onMutate: () => ({
      toastId: toast.loading(
        "Preparing audit export…",
        "Collecting every matching audit event.",
      ),
    }),
    onSettled: (_data, _error, _input, context) =>
      context && toast.dismiss(context.toastId),
  });
