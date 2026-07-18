import { describe, expect, it } from 'vitest';
import { parseWebEnvironment } from './env.parser';

describe('parseWebEnvironment', () => {
  it('accepts and normalizes an absolute API URL', () => {
    expect(parseWebEnvironment({ VITE_API_URL: 'https://api.imminiq.com/api/' })).toEqual({
      apiUrl: 'https://api.imminiq.com/api',
    });
  });

  it('accepts a same-origin API path used by the production proxy', () => {
    expect(parseWebEnvironment({ VITE_API_URL: '/api' })).toEqual({ apiUrl: '/api' });
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
    });
  });

  it('rejects unsupported Socket.IO URL protocols', () => {
    expect(() =>
      parseWebEnvironment({ VITE_API_URL: '/api', VITE_SOCKET_URL: 'javascript:alert(1)' })
    ).toThrow('VITE_SOCKET_URL must use HTTP or HTTPS');
  });
});
