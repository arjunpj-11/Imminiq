import { afterEach, describe, expect, it, vi } from 'vitest';

import { TwoFactorAuth } from '../../src/infrastructure/database/models/two-factor-auth.model';
import { requireStaffTwoFactor } from '../../src/shared/middlewares/admin.middleware';

describe('staff two-factor enforcement', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rejects staff accounts without active two-factor authentication', async () => {
    vi.spyOn(TwoFactorAuth, 'exists').mockResolvedValue(null);
    const request = { user: { userId: '64b000000000000000000001', role: 'admin' } };

    await expect(
      requireStaffTwoFactor(request as never, {} as never, vi.fn())
    ).rejects.toMatchObject({ code: 'STAFF_TWO_FACTOR_REQUIRED', statusCode: 403 });
  });

  it('allows staff accounts with active two-factor authentication', async () => {
    vi.spyOn(TwoFactorAuth, 'exists').mockResolvedValue({ _id: 'active' } as never);
    const next = vi.fn();
    const request = { user: { userId: '64b000000000000000000001', role: 'moderator' } };

    await requireStaffTwoFactor(request as never, {} as never, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
