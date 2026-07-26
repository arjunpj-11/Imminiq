export const socialQueryKeys = {
  all: ['social'] as const,
  chat: {
    all: ['social', 'chat'] as const,
    conversations: () => [...socialQueryKeys.chat.all, 'conversations'] as const,
    conversationList: (limit: number) =>
      [...socialQueryKeys.chat.conversations(), { limit }] as const,
    messages: (conversationId: string) =>
      [...socialQueryKeys.chat.all, 'messages', conversationId] as const,
    messageSearch: (conversationId: string, search: string) =>
      [...socialQueryKeys.chat.messages(conversationId), 'search', search] as const,
    savedMessages: () => [...socialQueryKeys.chat.all, 'saved-messages'] as const,
    blocks: () => [...socialQueryKeys.chat.all, 'blocks'] as const,
  },
  calls: {
    all: ['social', 'calls'] as const,
    active: () => [...socialQueryKeys.calls.all, 'active'] as const,
    historyRoot: () => [...socialQueryKeys.calls.all, 'history'] as const,
    history: (limit: number) => [...socialQueryKeys.calls.historyRoot(), { limit }] as const,
  },
};
