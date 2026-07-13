import {
  evaluateMockTestOpenAnswerAI,
  generateMockTestPerformanceInsightsAI,
  generateMockTestQuestionsAI,
  generateMockTestQuestionsGroqAI,
} from '../../../../../infrastructure/ai/ai.service';
import { MockTestsDomainError } from '../../domain/mock-tests-domain.error';
import type {
  IEvaluateAnswerInput,
  IEvaluateAnswerOutput,
  IGenerateInsightsInput,
  IGenerateQuestionsInput,
  IMockTestAIGateway,
} from '../../domain/services/mock-test-ai.interface';

function isServiceUnavailable(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status: number }).status === 503
  );
}

type GenerateQuestionsOutput = Awaited<ReturnType<IMockTestAIGateway['generateQuestions']>>;

export class GeminiGroqMockTestAIGateway implements IMockTestAIGateway {
  async generateQuestions(input: IGenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
    try {
      const result = await generateMockTestQuestionsAI({
        topic: input.topic,
        difficulty: input.difficulty,
        questionCount: input.questionCount,
        questionTypes: input.questionTypes,
      });
      return result as GenerateQuestionsOutput;
    } catch (error) {
      console.error('[GeminiGroq] generateQuestions Gemini failed:', error);

      if (isServiceUnavailable(error)) {
        console.warn('[GeminiGroq] Gemini 503 — falling back to Groq...');
        try {
          const safeTypes = input.questionTypes.filter((t) => t !== 'coding');
          const result = await generateMockTestQuestionsGroqAI({
            topic: input.topic,
            difficulty: input.difficulty,
            questionCount: input.questionCount,
            questionTypes: safeTypes.length > 0 ? safeTypes : ['mcq'],
          });
          return result as GenerateQuestionsOutput;
        } catch (groqError) {
          console.error('[GeminiGroq] Groq fallback also failed:', groqError);
        }
      }

      throw new MockTestsDomainError(
        'AI_GENERATION_FAILED',
        'Mock test question generation failed'
      );
    }
  }

  async evaluateOpenAnswer(input: IEvaluateAnswerInput): Promise<IEvaluateAnswerOutput> {
    try {
      const result = await evaluateMockTestOpenAnswerAI({
        question: input.question,
        correctAnswer: input.correctAnswer,
        userAnswer: input.userAnswer,
        maxPoints: input.maxPoints,
      });
      return result as IEvaluateAnswerOutput;
    } catch (error) {
      console.error('[GeminiGroq] evaluateOpenAnswer failed:', error);
      throw new MockTestsDomainError('AI_EVALUATION_FAILED', 'Mock test answer evaluation failed');
    }
  }

  async generatePerformanceInsights(input: IGenerateInsightsInput): Promise<string> {
    try {
      return await generateMockTestPerformanceInsightsAI({
        performanceTrends: input.performanceTrends,
        topicBreakdown: input.topicBreakdown,
      });
    } catch (error) {
      console.error('[GeminiGroq] generatePerformanceInsights failed:', error);
      throw new MockTestsDomainError(
        'AI_INSIGHTS_FAILED',
        'Mock test performance insight generation failed'
      );
    }
  }
}

export const geminiGroqMockTestAIGateway = new GeminiGroqMockTestAIGateway();
