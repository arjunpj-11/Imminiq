import type { TrackerClanChallengeEvent } from '../tracker-clan.types';

export interface ITrackerClanChallengeNotifier {
  notify(event: TrackerClanChallengeEvent): void;
}
