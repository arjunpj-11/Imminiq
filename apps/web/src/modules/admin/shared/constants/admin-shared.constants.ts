export const ADMIN_CONTENT_APPEALS_ENDPOINTS = {
  list: (kind: "trackers" | "mock-tests") => `/admin/${kind}/appeals`,
  detail: (kind: "trackers" | "mock-tests", id: string) =>
    `/admin/${kind}/appeals/${id}`,
} as const;
