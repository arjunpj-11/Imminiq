import { describe, expect, it } from 'vitest';

import { AuthRedirectResolver } from '../../src/modules/auth/application/services/auth-redirect.service';

describe('AuthRedirectResolver', () => {
  const resolver = new AuthRedirectResolver();

  it.each(['admin', 'superadmin', 'moderator'] as const)(
    'redirects %s accounts to the admin site',
    async (role) => {
      await expect(resolver.resolveRedirectPath('user-id', role)).resolves.toBe('/admin');
    }
  );

  it('redirects user accounts to the user dashboard', async () => {
    await expect(resolver.resolveRedirectPath('user-id', 'user')).resolves.toBe('/dashboard');
  });
});
