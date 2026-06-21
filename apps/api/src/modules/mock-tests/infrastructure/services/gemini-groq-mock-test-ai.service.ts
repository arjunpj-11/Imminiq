import {
  evaluateMockTestOpenAnswerAI,
  generateMockTestPerformanceInsightsAI,
  generateMockTestQuestionsAI,
} from '../../../../infrastructure/ai/ai.service'
import { MockTestsDomainError } from '../../domain/errors/mock-tests-domain.error'
import type {
  EvaluateAnswerInput,
  EvaluateAnswerOutput,
  GenerateInsightsInput,
  GenerateQuestionsInput,
  MockTestAIServiceContract,
} from '../../domain/services/mock-test-ai.service.interface'

type GenerateQuestionsOutput = Awaited<
  ReturnType<MockTestAIServiceContract['generateQuestions']>
>

export class GeminiGroqMockTestAIService
  implements MockTestAIServiceContract
{
  async generateQuestions(
    input: GenerateQuestionsInput
  ): Promise<GenerateQuestionsOutput> {
    try {
      const result = await generateMockTestQuestionsAI({
        topic: input.topic,
        difficulty: input.difficulty,
        questionCount: input.questionCount,
        questionTypes: input.questionTypes,
      })

      return result as GenerateQuestionsOutput
    } catch {
      throw new MockTestsDomainError(
        'AI_GENERATION_FAILED',
        'Mock test question generation failed'
      )
    }
  }

  async evaluateOpenAnswer(
    input: EvaluateAnswerInput
  ): Promise<EvaluateAnswerOutput> {
    try {
      const result = await evaluateMockTestOpenAnswerAI({
        question: input.question,
        correctAnswer: input.correctAnswer,
        userAnswer: input.userAnswer,
        maxPoints: input.maxPoints,
      })

      return result as EvaluateAnswerOutput
    } catch {
      throw new MockTestsDomainError(
        'AI_EVALUATION_FAILED',
        'Mock test answer evaluation failed'
      )
    }
  }

  async generatePerformanceInsights(
    input: GenerateInsightsInput
  ): Promise<string> {
    try {
      return await generateMockTestPerformanceInsightsAI({
        performanceTrends: input.performanceTrends,
        topicBreakdown: input.topicBreakdown,
      })
    } catch {
      throw new MockTestsDomainError(
        'AI_INSIGHTS_FAILED',
        'Mock test performance insight generation failed'
      )
    }
  }
}

export const geminiGroqMockTestAIService =
  new GeminiGroqMockTestAIService()