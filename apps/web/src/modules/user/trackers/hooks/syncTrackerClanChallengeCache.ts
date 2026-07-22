import type { QueryClient } from '@tanstack/react-query';

import type { ITrackerClanChallenge } from '../types/tracker.types';
import { trackerKeys } from './trackers.query-keys';

export const syncTrackerClanChallengeCache = (
  queryClient: QueryClient,
  trackerId: string,
  challenge: ITrackerClanChallenge
) => {
  queryClient.setQueryData<ITrackerClanChallenge[]>(
    trackerKeys.clanChallenges(trackerId),
    (current) => {
      if (!current) return current;

      const challengeExists = current.some((item) => item.id === challenge.id);
      return challengeExists
        ? current.map((item) => (item.id === challenge.id ? challenge : item))
        : [...current, challenge];
    }
  );
  queryClient.setQueryData(
    trackerKeys.clanChallenge(trackerId, challenge.id),
    challenge
  );
  queryClient.setQueryData<ITrackerClanChallenge | null>(
    trackerKeys.activeClanChallenge(),
    (current) =>
      challenge.status === 'active'
        ? challenge
        : current?.id === challenge.id
          ? null
          : current
  );
};
