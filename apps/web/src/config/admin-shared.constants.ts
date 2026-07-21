export const ADMIN_CONTENT_APPEALS_ENDPOINTS = {
  list: (kind: "trackers" | "mock-tests") => `/admin/${kind}/appeals`,
  detail: (kind: "trackers" | "mock-tests", id: string) =>
    `/admin/${kind}/appeals/${id}`,
} as const;

export const ADMIN_BULK_ACTION_ENDPOINTS = {
  users: '/admin/users/bulk/status',
  trackers: '/admin/trackers/bulk/lifecycle',
  'mock-tests': '/admin/mock-tests/bulk/lifecycle',
} as const;
