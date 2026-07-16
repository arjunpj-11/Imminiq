import {
  evaluateMockTestOpenAnswerAI,
  generateMockTestPerformanceInsightsAI,
  generateMockTestQuestionsAI,
  getAIUserMessage,
} from '../../../../../infrastructure/ai/ai.service';
import { MockTestsDomainError } from '../../domain/mock-tests-domain.error';
import type {
  IEvaluateAnswerInput,
  IEvaluateAnswerOutput,
  IGenerateInsightsInput,
  IGenerateQuestionsInput,
  IMockTestAIGateway,
} from '../../domain/services/mock-test-ai.interface';

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
      console.error('[Mock test AI] generateQuestions failed after provider fallbacks:', error);

      throw new MockTestsDomainError('AI_GENERATION_FAILED', getAIUserMessage(error));
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
      throw new MockTestsDomainError('AI_EVALUATION_FAILED', getAIUserMessage(error));
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
