import type { TrackerClanChallenge } from '../tracker-clan.types';

export interface ITrackerClanChallengeRepository {
  listChallenges(input: {
    trackerId: string;
    userId: string;
  }): Promise<TrackerClanChallenge[] | null>;
  createChallenge(input: {
    trackerId: string;
    challengerId: string;
    opponentId?: string;
    durationMinutes: number;
    questionCount: number;
  }): Promise<TrackerClanChallenge | null>;
  acceptChallenge(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallenge | null>;
  declineChallenge(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallenge | null>;
  cancelChallenge(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallenge | null>;
  submitChallenge(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    answers: Array<{ questionId: string; answer: string }>;
  }): Promise<TrackerClanChallenge | null>;
}
