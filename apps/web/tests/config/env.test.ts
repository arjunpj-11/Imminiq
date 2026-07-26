import { describe, expect, it } from 'vitest';
import { parseWebEnvironment } from '../../src/config/env.parser';

describe('parseWebEnvironment', () => {
  it('accepts and normalizes an absolute API URL', () => {
    expect(parseWebEnvironment({ VITE_API_URL: 'https://api.imminiq.com/api/' })).toEqual({
      apiUrl: 'https://api.imminiq.com/api',
      webrtcStunUrl: 'stun:stun.l.google.com:19302',
    });
  });

  it('accepts a same-origin API path used by the production proxy', () => {
    expect(parseWebEnvironment({ VITE_API_URL: '/api' })).toEqual({
      apiUrl: '/api',
      webrtcStunUrl: 'stun:stun.l.google.com:19302',
    });
  });

  it.each([undefined, '', '   '])('rejects a missing API URL', (value) => {
    expect(() => parseWebEnvironment({ VITE_API_URL: value })).toThrow('VITE_API_URL is required');
  });

  it('rejects unsupported URL protocols', () => {
    expect(() => parseWebEnvironment({ VITE_API_URL: 'javascript:alert(1)' })).toThrow(
      'VITE_API_URL must use HTTP or HTTPS'
    );
  });

  it('supports a direct Socket.IO host for static frontend deployments', () => {
    expect(
      parseWebEnvironment({
        VITE_API_URL: '/api',
        VITE_SOCKET_URL: 'https://imminiq-api.onrender.com/',
      })
    ).toEqual({
      apiUrl: '/api',
      socketUrl: 'https://imminiq-api.onrender.com',
      webrtcStunUrl: 'stun:stun.l.google.com:19302',
    });
  });

  it('accepts a custom WebRTC STUN server', () => {
    expect(
      parseWebEnvironment({
        VITE_API_URL: '/api',
        VITE_WEBRTC_STUN_URL: 'stuns:rtc.imminiq.com:5349',
      })
    ).toEqual({
      apiUrl: '/api',
      webrtcStunUrl: 'stuns:rtc.imminiq.com:5349',
    });
  });

  it('rejects unsupported Socket.IO URL protocols', () => {
    expect(() =>
      parseWebEnvironment({ VITE_API_URL: '/api', VITE_SOCKET_URL: 'javascript:alert(1)' })
    ).toThrow('VITE_SOCKET_URL must use HTTP or HTTPS');
  });

  it('rejects insecure absolute URLs in production', () => {
    expect(() =>
      parseWebEnvironment({ VITE_API_URL: 'http://api.imminiq.com/api', PROD: true })
    ).toThrow('VITE_API_URL must use HTTPS in production');
    expect(() =>
      parseWebEnvironment({
        VITE_API_URL: '/api',
        VITE_SOCKET_URL: 'http://api.imminiq.com',
        PROD: true,
      })
    ).toThrow('VITE_SOCKET_URL must use HTTPS in production');
  });
});
