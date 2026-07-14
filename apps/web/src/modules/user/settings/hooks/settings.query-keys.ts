export const settingsKeys = {
  all: ['settings'] as const,
  appearance: () => [...settingsKeys.all, 'appearance'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  privacy: () => [...settingsKeys.all, 'privacy'] as const,
  gestures: () => [...settingsKeys.all, 'gestures'] as const,
  security: () => ['security'] as const,
  securityOverview: () => [...settingsKeys.security(), 'overview'] as const,
};
