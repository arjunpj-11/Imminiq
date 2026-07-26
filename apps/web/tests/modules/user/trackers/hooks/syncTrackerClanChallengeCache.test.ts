import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import type { ITrackerClanChallenge } from '../../../../../src/modules/user/trackers/types/tracker.types';
import { syncTrackerClanChallengeCache } from '../../../../../src/modules/user/trackers/hooks/syncTrackerClanChallengeCache';
import { trackerKeys } from '../../../../../src/modules/user/trackers/hooks/trackers.query-keys';

const createChallenge = (status: ITrackerClanChallenge['status']): ITrackerClanChallenge =>
  ({
    id: 'challenge-1',
    status,
  }) as ITrackerClanChallenge;

describe('syncTrackerClanChallengeCache', () => {
  it('replaces the stale guild card and clears the active challenge when a battle finishes', () => {
    const queryClient = new QueryClient();
    const trackerId = 'tracker-1';
    const activeChallenge = createChallenge('active');
    const completedChallenge = createChallenge('completed');

    queryClient.setQueryData(trackerKeys.clanChallenges(trackerId), [activeChallenge]);
    queryClient.setQueryData(trackerKeys.activeClanChallenge(), activeChallenge);

    syncTrackerClanChallengeCache(queryClient, trackerId, completedChallenge);

    expect(
      queryClient.getQueryData<ITrackerClanChallenge[]>(trackerKeys.clanChallenges(trackerId))?.[0]
    ).toEqual(completedChallenge);
    expect(
      queryClient.getQueryData(trackerKeys.clanChallenge(trackerId, completedChallenge.id))
    ).toEqual(completedChallenge);
    expect(queryClient.getQueryData(trackerKeys.activeClanChallenge())).toBeNull();
  });
});
