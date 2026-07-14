import { describe, expect, it, vi } from 'vitest';

import { CurrentSessionResolver } from '../../src/modules/security/application/services/current-session.service';

describe('CurrentSessionResolver', () => {
  it('uses the authenticated access-token session id without reading a scoped refresh cookie', async () => {
    const repository = {
      findCurrentSessionByRefreshTokenHash: vi.fn(),
    };
    const hasher = { hash: vi.fn() };
    const resolver = new CurrentSessionResolver(repository as never, hasher as never);

    await expect(resolver.getCurrentSessionId(undefined, 'active-session-id')).resolves.toBe(
      'active-session-id'
    );
    expect(hasher.hash).not.toHaveBeenCalled();
    expect(repository.findCurrentSessionByRefreshTokenHash).not.toHaveBeenCalled();
  });

  it('keeps refresh-token lookup as a fallback for legacy sessions', async () => {
    const repository = {
      findCurrentSessionByRefreshTokenHash: vi.fn().mockResolvedValue({ id: 'legacy-session-id' }),
    };
    const hasher = { hash: vi.fn().mockReturnValue('hashed-refresh-token') };
    const resolver = new CurrentSessionResolver(repository as never, hasher as never);

    await expect(resolver.getCurrentSessionId('raw-refresh-token')).resolves.toBe(
      'legacy-session-id'
    );
    expect(hasher.hash).toHaveBeenCalledWith('raw-refresh-token');
  });
});
