import { describe, expect, it } from 'vitest';

import {
  REMOTE_TYPING_INDICATOR_TIMEOUT_MS,
  resolveRemoteTypingConversationId,
} from '../../../../../src/modules/user/social/utils/remote-typing-indicator';

describe('remote typing indicator', () => {
  it('shows the sender conversation and clears the matching stopped event', () => {
    expect(
      resolveRemoteTypingConversationId(null, {
        conversationId: 'conversation-1',
        isTyping: true,
      })
    ).toBe('conversation-1');
    expect(
      resolveRemoteTypingConversationId('conversation-1', {
        conversationId: 'conversation-1',
        isTyping: false,
      })
    ).toBeNull();
  });

  it('does not let a stale stopped event clear a newer conversation', () => {
    expect(
      resolveRemoteTypingConversationId('conversation-2', {
        conversationId: 'conversation-1',
        isTyping: false,
      })
    ).toBe('conversation-2');
  });

  it('uses a short safety expiry for disconnected senders', () => {
    expect(REMOTE_TYPING_INDICATOR_TIMEOUT_MS).toBe(3_000);
  });
});
