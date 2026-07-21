import type {
  TrackerClanChallenge,
  TrackerClanChallengeQuestion,
  TrackerClanChallengeQuestionContext,
  TrackerClanChallengeExtensionContext,
  TrackerClanChallengeHistory,
} from '../tracker-clan.types';

export interface ITrackerClanChallengeRepository {
  getActiveChallenge(userId: string): Promise<TrackerClanChallenge | null>;
  canCreateChallenge(input: { challengerId: string; opponentId?: string }): Promise<boolean>;
  getChallengeQuestionContext(input: {
    trackerId: string;
    challengerId: string;
    opponentId?: string;
  }): Promise<TrackerClanChallengeQuestionContext | null>;
  listChallenges(input: {
    trackerId: string;
    userId: string;
  }): Promise<TrackerClanChallenge[] | null>;
  getChallenge(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallenge | null>;
  getChallengeHistory(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallengeHistory | null>;
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
  quitChallenge(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallenge | null>;
  getChallengeExtensionContext(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallengeExtensionContext | null>;
  appendChallengeQuestions(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
    expectedQuestionCount: number;
    questions: TrackerClanChallengeQuestion[];
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
    questionId: string;
    answer: string;
  }): Promise<TrackerClanChallenge | null>;
  useChallengePower(input: {
    trackerId: string;
    challengeId: string;
    userId: string;
  }): Promise<TrackerClanChallenge | null>;
}
