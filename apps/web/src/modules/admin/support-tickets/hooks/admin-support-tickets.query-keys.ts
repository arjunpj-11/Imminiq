import type { AdminListQuery } from "../../shared";

export const adminSupportTicketsKeys = {
  all: ["admin", "support-tickets"] as const,
  list: (query: AdminListQuery) =>
    [...adminSupportTicketsKeys.all, "list", query] as const,
};
