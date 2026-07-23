import { describe, expect, it } from 'vitest';

import { CHAT_ENDPOINTS } from './chat.constants';

describe('social chat endpoint paths', () => {
  it('stays relative to the configured /api base URL', () => {
    const conversationId = '507f1f77bcf86cd799439011';

    expect(CHAT_ENDPOINTS.conversations).toBe('/chat/conversations');
    expect(CHAT_ENDPOINTS.messages(conversationId)).toBe(
      `/chat/conversations/${conversationId}/messages`
    );
    expect(CHAT_ENDPOINTS.read(conversationId)).toBe(
      `/chat/conversations/${conversationId}/read`
    );
    expect(CHAT_ENDPOINTS.forward(conversationId)).toBe(
      `/chat/messages/${conversationId}/forward`
    );
    expect(CHAT_ENDPOINTS.trackerShares).toBe('/chat/tracker-shares');
    expect(CHAT_ENDPOINTS.blocks).toBe('/chat/blocks');
  });
});
