export const moderationKeys = {
  all: ['moderation-appeals'] as const,
  accountStatuses: () => [...moderationKeys.all, 'account-status'] as const,
  accountStatus: (identifier: string) =>
    [...moderationKeys.accountStatuses(), identifier] as const,
  content: () => [...moderationKeys.all, 'content'] as const,
};
