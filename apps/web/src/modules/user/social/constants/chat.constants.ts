export const CHAT_ENDPOINTS = {
  conversations: '/chat/conversations',
  messages: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
  read: (conversationId: string) => `/chat/conversations/${conversationId}/read`,
  forward: (messageId: string) => `/chat/messages/${messageId}/forward`,
  star: (messageId: string) => `/chat/messages/${messageId}/star`,
  reaction: (messageId: string) => `/chat/messages/${messageId}/reactions`,
  message: (messageId: string) => `/chat/messages/${messageId}`,
  savedMessages: '/chat/saved-messages',
  clear: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
  trackerShares: '/chat/tracker-shares',
  profileShares: '/chat/profile-shares',
  blocks: '/chat/blocks',
  block: (userId: string) => `/chat/blocks/${userId}`,
} as const;

export const CHAT_PAGE_SIZE = 30;
export const CHAT_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const CHAT_MAX_VOICE_DURATION_SECONDS = 600;
