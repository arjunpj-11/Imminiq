import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore, type IAuthUser } from '../store/useAuthStore';
import { refreshAuthSession } from './auth-session-refresh';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../config/env', () => ({
  webEnvironment: { apiUrl: 'http://api.test/api' },
}));

const user: IAuthUser = {
  _id: 'user-1',
  fullName: 'Session User',
  username: 'session-user',
  role: 'user',
  status: 'active',
};

describe('refreshAuthSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('document', { cookie: 'csrfToken=test-csrf-token' });
    vi.stubGlobal('navigator', {});
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authReady: false,
    });
  });

  it('shares one request across concurrent refresh callers and restores the complete session', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    vi.mocked(axios.post).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const firstRefresh = refreshAuthSession();
    const secondRefresh = refreshAuthSession();

    expect(secondRefresh).toBe(firstRefresh);
    expect(axios.post).toHaveBeenCalledTimes(1);

    resolveRequest?.({
      data: {
        success: true,
        message: 'Token refreshed',
        data: { accessToken: 'new-access-token', user },
      },
    });

    await expect(firstRefresh).resolves.toEqual({
      accessToken: 'new-access-token',
      user,
    });
    expect(useAuthStore.getState()).toMatchObject({
      user,
      accessToken: 'new-access-token',
      isAuthenticated: true,
      authReady: true,
    });
  });
});
