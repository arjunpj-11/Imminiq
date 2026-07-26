import { describe, expect, it } from 'vitest';

import { resolveSocketOrigin, SOCKET_PATH } from '../../src/lib/socket-url';

describe('Socket.IO URL configuration', () => {
  it('uses the API server origin without treating /api as a namespace', () => {
    expect(resolveSocketOrigin('http://localhost:5001/api', 'http://localhost:5173')).toBe(
      'http://localhost:5001'
    );
  });

  it('uses the browser origin for a root-relative production API URL', () => {
    expect(resolveSocketOrigin('/api', 'https://imminiq.example')).toBe('https://imminiq.example');
  });

  it('keeps Socket.IO traffic inside the API proxy', () => {
    expect(SOCKET_PATH).toBe('/api/socket.io');
  });
});
