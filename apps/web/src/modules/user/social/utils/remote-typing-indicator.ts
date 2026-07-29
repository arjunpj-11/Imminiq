export const REMOTE_TYPING_INDICATOR_TIMEOUT_MS = 3_000;

export type RemoteTypingEvent = {
  conversationId?: string;
  isTyping?: boolean;
};

export const resolveRemoteTypingConversationId = (
  currentConversationId: string | null,
  event: RemoteTypingEvent
) => {
  const eventConversationId = event.conversationId ?? null;

  if (event.isTyping) return eventConversationId;
  if (!eventConversationId || currentConversationId === eventConversationId) return null;

  return currentConversationId;
};
