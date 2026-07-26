import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/config/env', () => ({
  webEnvironment: {
    webrtcStunUrl: 'stun:stun.example.test:3478',
  },
}));

vi.mock('../../../../../src/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import api from '../../../../../src/lib/axios';
import { loadCallIceServers } from '../../../../../src/modules/user/social/utils/load-call-ice-servers';

describe('loadCallIceServers', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('uses the complete authenticated ICE configuration returned by the API', async () => {
    const iceServers: RTCIceServer[] = [
      { urls: 'stun:stun.relay.metered.ca:80' },
      {
        urls: 'turns:standard.relay.metered.ca:443?transport=tcp',
        username: 'temporary-user',
        credential: 'temporary-credential',
      },
    ];
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        message: 'Secure call configuration loaded',
        data: { iceServers, expiresInSeconds: 14_400 },
      },
    });

    await expect(loadCallIceServers()).resolves.toEqual(iceServers);
  });

  it('falls back to public STUN when secure relay configuration is unavailable', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('provider unavailable'));

    await expect(loadCallIceServers()).resolves.toEqual([{ urls: 'stun:stun.example.test:3478' }]);
  });
});
