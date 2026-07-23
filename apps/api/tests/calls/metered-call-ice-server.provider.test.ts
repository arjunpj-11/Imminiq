import { describe, expect, it, vi } from 'vitest';

import { MeteredCallIceServerProvider } from '../../src/modules/user/calls/infrastructure/services/metered-call-ice-server.provider';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('MeteredCallIceServerProvider', () => {
  it('creates an expiring credential, loads the complete ICE array, and caches it per user', async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          username: 'temporary-user',
          password: 'temporary-password',
          apiKey: 'credential-api-key',
        })
      )
      .mockResolvedValueOnce(
        jsonResponse([
          { urls: 'stun:stun.relay.metered.ca:80' },
          {
            urls: 'turn:standard.relay.metered.ca:80',
            username: 'temporary-user',
            credential: 'temporary-password',
          },
          {
            urls: 'turns:standard.relay.metered.ca:443?transport=tcp',
            username: 'temporary-user',
            credential: 'temporary-password',
          },
        ])
      );
    const provider = new MeteredCallIceServerProvider({
      apiBaseUrl: 'https://imminiq.metered.live',
      secretKey: 'server-only-secret',
      credentialTtlSeconds: 14_400,
      requestTimeoutMs: 8_000,
      request,
      now: () => 1_000,
    });

    const first = await provider.getIceServers('user-id');
    const second = await provider.getIceServers('user-id');

    expect(first).toHaveLength(3);
    expect(second).toBe(first);
    expect(request).toHaveBeenCalledTimes(2);

    const createUrl = new URL(String(request.mock.calls[0]?.[0]));
    expect(createUrl.pathname).toBe('/api/v1/turn/credential');
    expect(createUrl.searchParams.get('secretKey')).toBe('server-only-secret');
    expect(JSON.parse(String(request.mock.calls[0]?.[1]?.body))).toMatchObject({
      expiryInSeconds: 14_400,
    });

    const loadUrl = new URL(String(request.mock.calls[1]?.[0]));
    expect(loadUrl.pathname).toBe('/api/v1/turn/credentials');
    expect(loadUrl.searchParams.get('apiKey')).toBe('credential-api-key');
  });

  it('rejects an invalid provider response without exposing provider details', async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ apiKey: 'credential-api-key' }))
      .mockResolvedValueOnce(
        jsonResponse([{ urls: 'turn:standard.relay.metered.ca:80' }])
      );
    const provider = new MeteredCallIceServerProvider({
      apiBaseUrl: 'https://imminiq.metered.live',
      secretKey: 'server-only-secret',
      credentialTtlSeconds: 14_400,
      requestTimeoutMs: 8_000,
      request,
    });

    await expect(provider.getIceServers('user-id')).rejects.toMatchObject({
      code: 'METERED_TURN_UNAVAILABLE',
      publicMessage: 'Secure call relay is temporarily unavailable',
    });
  });
});
