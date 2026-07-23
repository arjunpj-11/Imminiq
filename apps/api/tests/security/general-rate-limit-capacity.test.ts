import { describe, expect, it } from 'vitest';

import { RUNTIME_DEFAULTS } from '../../src/config/constants';

describe('general API rate-limit capacity', () => {
  it('supports polling-heavy authenticated workflows without weakening sensitive limits', () => {
    expect(RUNTIME_DEFAULTS.RATE_LIMIT_AUTHENTICATED_API_MAX).toBeGreaterThanOrEqual(
      3_000
    );
    expect(RUNTIME_DEFAULTS.RATE_LIMIT_GLOBAL_MAX).toBeGreaterThanOrEqual(
      RUNTIME_DEFAULTS.RATE_LIMIT_AUTHENTICATED_API_MAX
    );
    expect(RUNTIME_DEFAULTS.RATE_LIMIT_LOGIN_MAX).toBeLessThan(
      RUNTIME_DEFAULTS.RATE_LIMIT_AUTHENTICATED_API_MAX
    );
    expect(RUNTIME_DEFAULTS.RATE_LIMIT_OTP_SEND_MAX).toBeLessThan(
      RUNTIME_DEFAULTS.RATE_LIMIT_AUTHENTICATED_API_MAX
    );
  });
});
