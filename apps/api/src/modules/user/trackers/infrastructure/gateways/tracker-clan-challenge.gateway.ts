import { emitTrackerClanChallenge } from '../../../../../infrastructure/realtime/socket';
import type { ITrackerClanChallengeNotifier, TrackerClanChallengeEvent } from '../../domain';

export class TrackerClanChallengeGateway implements ITrackerClanChallengeNotifier {
  notify(event: TrackerClanChallengeEvent) {
    emitTrackerClanChallenge(event);
  }
}

export const trackerClanChallengeGateway = new TrackerClanChallengeGateway();
