import { describe, expect, it } from 'vitest';

import { getCountdownDeadlineMs } from '../../../../../src/modules/user/mock-tests/hooks/useCountdown';

describe('getCountdownDeadlineMs', () => {
  it('anchors the deadline to the server-provided attempt start time', () => {
    expect(
      getCountdownDeadlineMs(
        30 * 60,
        '2026-07-29T06:00:00.000Z',
        Date.parse('2026-07-29T06:05:00Z')
      )
    ).toBe(Date.parse('2026-07-29T06:30:00.000Z'));
  });

  it('starts a local countdown when no valid server start time is available', () => {
    const nowMs = Date.parse('2026-07-29T06:05:00.000Z');

    expect(getCountdownDeadlineMs(90, undefined, nowMs)).toBe(nowMs + 90_000);
    expect(getCountdownDeadlineMs(90, 'invalid', nowMs)).toBe(nowMs + 90_000);
  });
});
