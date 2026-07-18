import type {
  TrackerClanChallengeQuestion,
  TrackerClanChallengeQuestionContext,
} from '../tracker-clan.types';

export interface ITrackerClanChallengeQuestionGenerator {
  generate(input: {
    context: TrackerClanChallengeQuestionContext;
    questionCount: number;
    durationMinutes: number;
  }): Promise<TrackerClanChallengeQuestion[]>;
}
