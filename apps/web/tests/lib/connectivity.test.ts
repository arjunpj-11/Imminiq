import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isAppReachable } from '../../src/lib/connectivity';

describe('isAppReachable', () => {
  beforeEach(() => {
    vi.stubGlobal('window', globalThis);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts the browser online signal without making a probe request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', fetchMock);

    await expect(isAppReachable()).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses a successful reachability probe when the browser reports offline', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('navigator', { onLine: false });
    vi.stubGlobal('fetch', fetchMock);

    await expect(isAppReachable()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('reports offline when the browser and reachability probe both fail', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));

    await expect(isAppReachable()).resolves.toBe(false);
  });
});
