import { describe, expect, it } from 'vitest';

import { shouldRetryQuery } from '../../src/lib/queryClient';

describe('query retry policy', () => {
  it('does not retry rate-limited responses', () => {
    expect(
      shouldRetryQuery(0, {
        isAxiosError: true,
        response: { status: 429 },
      })
    ).toBe(false);
  });

  it('still retries transient server failures within the retry budget', () => {
    expect(
      shouldRetryQuery(0, {
        isAxiosError: true,
        response: { status: 503 },
      })
    ).toBe(true);
    expect(shouldRetryQuery(2, new Error('network unavailable'))).toBe(false);
  });
});
