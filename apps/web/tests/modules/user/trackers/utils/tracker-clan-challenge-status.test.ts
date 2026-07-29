import { describe, expect, it } from 'vitest';

import {
  getTrackerClanChallengeTerminalMessage,
  isTrackerClanChallengeTerminal,
} from '../../../../../src/modules/user/trackers/utils/tracker-clan-challenge-status';

describe('tracker guild challenge status', () => {
  it.each(['completed', 'declined', 'cancelled', 'expired'] as const)(
    'treats %s as terminal',
    (status) => {
      expect(isTrackerClanChallengeTerminal(status)).toBe(true);
    }
  );

  it.each(['open', 'pending', 'active'] as const)('keeps %s non-terminal', (status) => {
    expect(isTrackerClanChallengeTerminal(status)).toBe(false);
  });

  it('explains moderation cancellation without showing an endless loading state', () => {
    expect(getTrackerClanChallengeTerminalMessage('cancelled')).toEqual({
      title: 'This battle was cancelled',
      description:
        'The guild or tracker is no longer available for this battle. No result was recorded.',
    });
  });
});
