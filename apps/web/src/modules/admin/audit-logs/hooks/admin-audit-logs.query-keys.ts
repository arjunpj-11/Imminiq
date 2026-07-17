import type { AdminListQuery } from "../../shared";

export const adminAuditLogsKeys = {
  all: ["admin", "audit-logs"] as const,
  list: (query: AdminListQuery) =>
    [...adminAuditLogsKeys.all, "list", query] as const,
};
