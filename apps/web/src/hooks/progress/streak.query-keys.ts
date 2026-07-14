export const streakQueryKeys = {
  all: ['progress-streak'] as const,
  me: (year?: number) => [...streakQueryKeys.all, 'me', year ?? 'current'] as const,
};
