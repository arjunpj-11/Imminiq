import {
  evaluateMockTestOpenAnswerAI,
  generateMockTestPerformanceInsightsAI,
  generateMockTestQuestionsAI,
  generateMockTestQuestionsGroqAI,
} from '../../../../infrastructure/ai/ai.service'
import { MockTestsDomainError } from '../../domain/errors/mock-tests-domain.error'
import type {
  EvaluateAnswerInput,
  EvaluateAnswerOutput,
  GenerateInsightsInput,
  GenerateQuestionsInput,
  MockTestAIServiceContract,
} from '../../domain/services/mock-test-ai.service.interface'

function isServiceUnavailable(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status: number }).status === 503
  )
}

type GenerateQuestionsOutput = Awaited<ReturnType<MockTestAIServiceContract['generateQuestions']>>

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
    } catch (error) {
      console.error('[GeminiGroq] generateQuestions Gemini failed:', error)

      if (isServiceUnavailable(error)) {
        console.warn('[GeminiGroq] Gemini 503 — falling back to Groq...')
        try {
          const safeTypes = input.questionTypes.filter(t => t !== 'coding')
          const result = await generateMockTestQuestionsGroqAI({
            topic: input.topic,
            difficulty: input.difficulty,
            questionCount: input.questionCount,
            questionTypes: safeTypes.length > 0 ? safeTypes : ['mcq'],
          })
          return result as GenerateQuestionsOutput
        } catch (groqError) {
          console.error('[GeminiGroq] Groq fallback also failed:', groqError)
        }
      }

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
    } catch (error) {
      console.error('[GeminiGroq] evaluateOpenAnswer failed:', error)
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
    } catch (error) {
      console.error('[GeminiGroq] generatePerformanceInsights failed:', error)
      throw new MockTestsDomainError(
        'AI_INSIGHTS_FAILED',
        'Mock test performance insight generation failed'
      )
    }
  }
}

export const geminiGroqMockTestAIService = new GeminiGroqMockTestAIService()