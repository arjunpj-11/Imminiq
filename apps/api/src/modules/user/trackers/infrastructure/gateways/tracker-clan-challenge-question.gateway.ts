import { generateTrackerClanChallengeQuestionsAI } from '../../../../../infrastructure/ai/ai.service';
import type { ITrackerClanChallengeQuestionGenerator } from '../../domain';

export class TrackerClanChallengeQuestionGateway
  implements ITrackerClanChallengeQuestionGenerator
{
  generate(
    input: Parameters<ITrackerClanChallengeQuestionGenerator['generate']>[0]
  ): ReturnType<ITrackerClanChallengeQuestionGenerator['generate']> {
    return generateTrackerClanChallengeQuestionsAI({
      ...input.context,
      questionCount: input.questionCount,
      durationMinutes: input.durationMinutes,
    });
  }
}

export const trackerClanChallengeQuestionGateway =
  new TrackerClanChallengeQuestionGateway();
