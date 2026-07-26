export const CHAT_ROUTE_PATHS = {
  CONVERSATIONS: '/conversations',
  MESSAGES: '/conversations/:conversationId/messages',
  READ: '/conversations/:conversationId/read',
  FORWARD: '/messages/:messageId/forward',
  STAR: '/messages/:messageId/star',
  CLEAR: '/conversations/:conversationId/messages',
  TRACKER_SHARES: '/tracker-shares',
  PROFILE_SHARES: '/profile-shares',
  BLOCKS: '/blocks',
  BLOCK_BY_USER: '/blocks/:userId',
} as const;
