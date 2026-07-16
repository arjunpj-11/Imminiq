import { z } from 'zod';

import { dependencyFailure } from '../../../shared/errors/service.error';

import { parseAIJson } from '../ai-json.parser';
import {
  economyAIChatWithFallback as groqChat,
  economyAIStructuredWithFallback,
} from '../ai-fallback.helper';
import { buildMockTestAnswerEvaluationPrompt } from '../prompts/mock-test-answer-evaluation.prompt';
import { buildMockTestPerformanceInsightPrompt } from '../prompts/mock-test-performance-insight.prompt';
import { buildMockTestQuestionsPrompt } from '../prompts/mock-test-questions.prompt';

export type MockTestAIQuestionType = 'mcq' | 'short_answer' | 'coding';
export type MockTestAIDifficulty = 'easy' | 'medium' | 'hard';
export type MockTestAICodingLanguage =
  'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'c';

export type GenerateMockTestQuestionsAIInput = {
  topic: string;
  difficulty: string;
  questionCount: number;
  questionTypes: string[];
};

export type EvaluateMockTestOpenAnswerAIInput = {
  question: string;
  correctAnswer?: string;
  userAnswer: string;
  maxPoints: number;
};

export type GenerateMockTestPerformanceInsightsAIInput = {
  performanceTrends: unknown;
  topicBreakdown: unknown;
};

const mockTestCodingTestCaseSchema = z.object({
  input: z.array(z.unknown()),
  expectedOutput: z.unknown(),
  isHidden: z.boolean().default(false),
  explanation: z.string().trim().optional(),
});

const mockTestCodingSchema = z.object({
  functionName: z.string().trim().min(1),
  language: z
    .enum(['javascript', 'typescript', 'python', 'java', 'cpp', 'c'])
    .default('javascript'),
  inputTypes: z.array(z.string().trim().min(1)).default([]),
  outputType: z.string().trim().min(1),
  starterCode: z.string().default(''),
  templates: z.object({
    javascript: z.string().default(''),
    typescript: z.string().default(''),
    python: z.string().default(''),
    java: z.string().default(''),
    cpp: z.string().default(''),
    c: z.string().default(''),
  }),
  testCases: z.array(mockTestCodingTestCaseSchema).min(1),
});

const mockTestQuestionSchema = z.object({
  type: z.enum(['mcq', 'short_answer', 'coding']),
  question: z.string().trim().min(1),
  options: z.array(z.string().trim()).default([]),
  correctAnswer: z.string().trim().default(''),
  explanation: z.string().trim().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.number().int().min(1).max(10),
  coding: mockTestCodingSchema.optional(),
});

const generateMockTestQuestionsSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().default(''),
  questions: z.array(mockTestQuestionSchema).min(1),
});

const evaluateMockTestOpenAnswerSchema = z.object({
  score: z.number().min(0),
  isCorrect: z.boolean(),
  feedback: z.string().trim().min(1),
});

export type GenerateMockTestQuestionsAIOutput = z.infer<typeof generateMockTestQuestionsSchema>;

export type EvaluateMockTestOpenAnswerAIOutput = z.infer<typeof evaluateMockTestOpenAnswerSchema>;

const STANDARD_QUESTION_BATCH_SIZE = 8;
const CODING_QUESTION_BATCH_SIZE = 2;

export const generateMockTestQuestionsAI = async (
  input: GenerateMockTestQuestionsAIInput
): Promise<GenerateMockTestQuestionsAIOutput> => {
  const containsCoding = input.questionTypes.includes('coding');
  const batchSize = containsCoding ? CODING_QUESTION_BATCH_SIZE : STANDARD_QUESTION_BATCH_SIZE;
  const batches: GenerateMockTestQuestionsAIOutput[] = [];

  for (let generatedCount = 0; generatedCount < input.questionCount; generatedCount += batchSize) {
    const questionCount = Math.min(batchSize, input.questionCount - generatedCount);
    const batchInput = { ...input, questionCount };
    const batchNumber = batches.length + 1;

    const batch = await economyAIStructuredWithFallback(
      [{ role: 'user', content: buildMockTestQuestionsPrompt(batchInput) }],
      (response) => {
        const parsed = parseAIJson(response, generateMockTestQuestionsSchema);
        if (parsed.questions.length !== questionCount) {
          throw dependencyFailure(
            `AI returned ${parsed.questions.length} questions instead of ${questionCount}`,
            'AI_INVALID_JSON_STRUCTURE'
          );
        }
        return parsed;
      },
      'quality',
      'mock_test_generation',
      {
        operation: `mock-test-generation-batch-${batchNumber}`,
        groqMaxTokens: containsCoding ? 8192 : 4096,
        temperature: 0.5,
      }
    );
    batches.push(batch);
  }

  const firstBatch = batches[0];
  if (!firstBatch) {
    throw dependencyFailure(
      'Mock test generation received an invalid zero question count',
      'MOCK_TEST_AI_INVALID_QUESTION_COUNT'
    );
  }

  return {
    title: firstBatch.title,
    description: firstBatch.description,
    questions: batches.flatMap((batch) => batch.questions),
  };
};

export const evaluateMockTestOpenAnswerAI = async (
  input: EvaluateMockTestOpenAnswerAIInput
): Promise<EvaluateMockTestOpenAnswerAIOutput> => {
  return economyAIStructuredWithFallback(
    [
      {
        role: 'user',
        content: buildMockTestAnswerEvaluationPrompt(input),
      },
    ],
    (response) => parseAIJson(response, evaluateMockTestOpenAnswerSchema),
    'quality',
    'mock_test_evaluation',
    { operation: 'mock-test-answer-evaluation', temperature: 0.1 }
  );
};

export const generateMockTestPerformanceInsightsAI = async (
  input: GenerateMockTestPerformanceInsightsAIInput
): Promise<string> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: buildMockTestPerformanceInsightPrompt(input),
      },
    ],
    'fast',
    'mock_test_evaluation',
    { operation: 'mock-test-performance-insights' }
  );

  return response || 'Keep practicing to improve your performance across all topics.';
};

// Kept for callers compiled against the old name. Generation now always uses
// the complete validated provider chain instead of a second Groq-only path.
export const generateMockTestQuestionsGroqAI = generateMockTestQuestionsAI;
