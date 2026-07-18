import type {
  TrackerClanChallenge,
  TrackerClanChallengeQuestion,
  TrackerClanChallengeQuestionContext,
} from '../tracker-clan.types';

export interface ITrackerClanChallengeRepository {
  getChallengeQuestionContext(input: {
    trackerId: string;
    challengerId: string;
    opponentId?: string;
  }): Promise<TrackerClanChallengeQuestionContext | null>;
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
    questions: TrackerClanChallengeQuestion[];
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
  chooseChallengeCheckpoint(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    decision: 'attempt' | 'skip';
  }): Promise<TrackerClanChallenge | null>;
  answerChallengeNode(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    answer: string;
  }): Promise<TrackerClanChallenge | null>;
  useChallengePower(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallenge | null>;
}
