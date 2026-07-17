export const adminDashboardKeys = {
  all: ["admin", "dashboard"] as const,
  overview: () => [...adminDashboardKeys.all, "overview"] as const,
};
