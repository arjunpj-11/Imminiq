import type { TrackerClanChallengeStatus } from '../types/tracker.types';

const TERMINAL_TRACKER_CLAN_CHALLENGE_STATUSES = new Set<TrackerClanChallengeStatus>([
  'completed',
  'declined',
  'cancelled',
  'expired',
]);

export const isTrackerClanChallengeTerminal = (status: TrackerClanChallengeStatus) =>
  TERMINAL_TRACKER_CLAN_CHALLENGE_STATUSES.has(status);

export const getTrackerClanChallengeTerminalMessage = (status: TrackerClanChallengeStatus) => {
  if (status === 'cancelled') {
    return {
      title: 'This battle was cancelled',
      description:
        'The guild or tracker is no longer available for this battle. No result was recorded.',
    };
  }
  if (status === 'declined') {
    return {
      title: 'Challenge declined',
      description: 'The invited guild member declined this battle.',
    };
  }
  if (status === 'expired') {
    return {
      title: 'Challenge expired',
      description: 'The invitation was not accepted before its deadline.',
    };
  }

  return null;
};
