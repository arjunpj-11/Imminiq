export const adminSettingsKeys = {
  all: ["admin", "settings"] as const,
  detail: () => [...adminSettingsKeys.all, "detail"] as const,
};
