import { describe, expect, it, vi } from 'vitest';

import { createRequireEnabledFeature } from '../../src/shared/middlewares/feature-availability.middleware';
import { PLATFORM_POLICY_DEFAULTS } from '../../src/shared/platform-policy';

describe('admin-managed feature availability', () => {
  it('allows requests when the admin-managed feature is enabled', async () => {
    const reader = {
      getFeaturePolicy: vi.fn().mockResolvedValue({
        ...PLATFORM_POLICY_DEFAULTS.features,
        community: true,
      }),
    };
    const next = vi.fn();

    await createRequireEnabledFeature(reader, 'community', 'Community')(
      {} as never,
      {} as never,
      next
    );

    expect(next).toHaveBeenCalledWith();
  });

  it('stops user requests with a stable maintenance error when disabled', async () => {
    const reader = {
      getFeaturePolicy: vi.fn().mockResolvedValue({
        ...PLATFORM_POLICY_DEFAULTS.features,
        community: false,
      }),
    };
    const next = vi.fn();

    await createRequireEnabledFeature(reader, 'community', 'Community')(
      {} as never,
      {} as never,
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 503,
        code: 'FEATURE_TEMPORARILY_UNAVAILABLE',
      })
    );
  });

  it('fails closed when availability cannot be read', async () => {
    const reader = {
      getFeaturePolicy: vi.fn().mockRejectedValue(new Error('database unavailable')),
    };
    const next = vi.fn();

    await createRequireEnabledFeature(reader, 'community', 'Community')(
      {} as never,
      {} as never,
      next
    );

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'database unavailable' }));
  });

  it('applies an admin pause to the very next request', async () => {
    const reader = {
      getFeaturePolicy: vi
        .fn()
        .mockResolvedValueOnce({ ...PLATFORM_POLICY_DEFAULTS.features, community: true })
        .mockResolvedValueOnce({ ...PLATFORM_POLICY_DEFAULTS.features, community: false }),
    };
    const middleware = createRequireEnabledFeature(reader, 'community', 'Community');
    const firstNext = vi.fn();
    const secondNext = vi.fn();

    await middleware({} as never, {} as never, firstNext);
    await middleware({} as never, {} as never, secondNext);

    expect(firstNext).toHaveBeenCalledWith();
    expect(secondNext).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'FEATURE_TEMPORARILY_UNAVAILABLE' })
    );
    expect(reader.getFeaturePolicy).toHaveBeenCalledTimes(2);
  });
});
