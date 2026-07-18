import { z } from 'zod';

import { dependencyFailure } from '../../../shared/errors/service.error';
import { parseAIJson } from '../ai-json.parser';
import { economyAIStructuredWithFallback } from '../ai-fallback.helper';
import {
  buildTrackerClanChallengePrompt,
  type TrackerClanChallengePromptInput,
} from '../prompts/tracker-clan-challenge.prompt';

const challengeQuestionSchema = z
  .object({
    prompt: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).length(4),
    correctAnswer: z.string().trim().min(1),
    topicTitle: z.string().trim().min(1),
    points: z.literal(1),
    isCheckpoint: z.boolean().default(false),
  })
  .superRefine((question, context) => {
    if (new Set(question.options).size !== question.options.length) {
      context.addIssue({ code: 'custom', message: 'Question options must be distinct' });
    }
    if (!question.options.includes(question.correctAnswer)) {
      context.addIssue({ code: 'custom', message: 'Correct answer must match an option' });
    }
  });

const challengeQuestionsSchema = z.object({
  questions: z.array(challengeQuestionSchema).min(1).max(15),
});

export type TrackerClanChallengeAIQuestion = z.infer<typeof challengeQuestionSchema>;

export const generateTrackerClanChallengeQuestionsAI = async (
  input: TrackerClanChallengePromptInput
): Promise<TrackerClanChallengeAIQuestion[]> => {
  const result = await economyAIStructuredWithFallback(
    [{ role: 'user', content: buildTrackerClanChallengePrompt(input) }],
    (response) => {
      const parsed = parseAIJson(response, challengeQuestionsSchema);
      if (parsed.questions.length !== input.questionCount) {
        throw dependencyFailure(
          `AI returned ${parsed.questions.length} guild questions instead of ${input.questionCount}`,
          'AI_INVALID_JSON_STRUCTURE'
        );
      }
      return parsed;
    },
    'quality',
    'mock_test_generation',
    {
      operation: 'tracker-clan-challenge-generation',
      groqMaxTokens: 4096,
      temperature: 0.45,
    }
  );
  return result.questions.map((question, index) => ({
    ...question,
    isCheckpoint: (index + 1) % 5 === 0,
  }));
};
