import { describe, expect, it } from 'vitest';

import { InMemoryChatPresenceProvider } from '../../src/infrastructure/realtime/chat-presence.provider';

describe('chat presence provider', () => {
  it('keeps a user online until their final connection closes', () => {
    const provider = new InMemoryChatPresenceProvider();

    expect(provider.connect('user-1', 'socket-1')).toBe(true);
    expect(provider.connect('user-1', 'socket-2')).toBe(false);
    expect(provider.isOnline('user-1')).toBe(true);
    expect(provider.disconnect('user-1', 'socket-1')).toBe(false);
    expect(provider.isOnline('user-1')).toBe(true);
    expect(provider.disconnect('user-1', 'socket-2')).toBe(true);
    expect(provider.isOnline('user-1')).toBe(false);
  });
});
