export const CHAT_ROUTE_PATHS = {
  CONVERSATIONS: '/conversations',
  MESSAGES: '/conversations/:conversationId/messages',
  READ: '/conversations/:conversationId/read',
  FORWARD: '/messages/:messageId/forward',
  TRACKER_SHARES: '/tracker-shares',
  BLOCKS: '/blocks',
  BLOCK_BY_USER: '/blocks/:userId',
} as const;
