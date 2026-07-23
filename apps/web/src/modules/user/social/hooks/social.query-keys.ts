export const socialQueryKeys = {
  all: ['social'] as const,
  chat: {
    all: ['social', 'chat'] as const,
    conversations: () => [...socialQueryKeys.chat.all, 'conversations'] as const,
    conversationList: (limit: number) =>
      [...socialQueryKeys.chat.conversations(), { limit }] as const,
    messages: (conversationId: string) =>
      [...socialQueryKeys.chat.all, 'messages', conversationId] as const,
    blocks: () => [...socialQueryKeys.chat.all, 'blocks'] as const,
  },
  calls: {
    all: ['social', 'calls'] as const,
    active: () => [...socialQueryKeys.calls.all, 'active'] as const,
    historyRoot: () => [...socialQueryKeys.calls.all, 'history'] as const,
    history: (limit: number) =>
      [...socialQueryKeys.calls.historyRoot(), { limit }] as const,
  },
};
