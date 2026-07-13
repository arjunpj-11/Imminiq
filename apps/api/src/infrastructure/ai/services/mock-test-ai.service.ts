import { z } from 'zod'

import { ApiError } from '../../../shared/utils/ApiError'

import { parseAIJson } from '../ai-json.parser'
import { economyAIChatWithFallback as groqChat } from '../ai-fallback.helper'
import { buildMockTestAnswerEvaluationPrompt } from '../prompts/mock-test-answer-evaluation.prompt'
import { buildMockTestPerformanceInsightPrompt } from '../prompts/mock-test-performance-insight.prompt'
import { buildMockTestQuestionsPrompt } from '../prompts/mock-test-questions.prompt'

export type MockTestAIQuestionType = 'mcq' | 'short_answer' | 'coding'
export type MockTestAIDifficulty = 'easy' | 'medium' | 'hard'
export type MockTestAICodingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'

export type GenerateMockTestQuestionsAIInput = {
  topic: string
  difficulty: string
  questionCount: number
  questionTypes: string[]
}

export type EvaluateMockTestOpenAnswerAIInput = {
  question: string
  correctAnswer?: string
  userAnswer: string
  maxPoints: number
}

export type GenerateMockTestPerformanceInsightsAIInput = {
  performanceTrends: unknown
  topicBreakdown: unknown
}

const mockTestCodingTestCaseSchema = z.object({
  input: z.array(z.unknown()),
  expectedOutput: z.unknown(),
  isHidden: z.boolean().default(false),
  explanation: z.string().trim().optional(),
})

const mockTestCodingSchema = z.object({
  functionName: z.string().trim().min(1),
  language: z
    .enum([
      'javascript',
      'typescript',
      'python',
      'java',
      'cpp',
      'c',
    ])
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
})

const mockTestQuestionSchema = z.object({
  type: z.enum(['mcq', 'short_answer', 'coding']),
  question: z.string().trim().min(1),
  options: z.array(z.string().trim()).default([]),
 correctAnswer: z.string().trim().default(''),
  explanation: z.string().trim().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  points: z.number().int().min(1).max(10),
  coding: mockTestCodingSchema.optional(),
})

const generateMockTestQuestionsSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().default(''),
  questions: z.array(mockTestQuestionSchema).min(1),
})

const evaluateMockTestOpenAnswerSchema = z.object({
  score: z.number().min(0),
  isCorrect: z.boolean(),
  feedback: z.string().trim().min(1),
})

export type GenerateMockTestQuestionsAIOutput = z.infer<
  typeof generateMockTestQuestionsSchema
>

export type EvaluateMockTestOpenAnswerAIOutput = z.infer<
  typeof evaluateMockTestOpenAnswerSchema
>

export const generateMockTestQuestionsAI = async (
  input: GenerateMockTestQuestionsAIInput
): Promise<GenerateMockTestQuestionsAIOutput> => {
  const response = await groqChat(
    [{ role: 'user', content: buildMockTestQuestionsPrompt(input) }],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Mock test question generation returned an empty response',
      'MOCK_TEST_AI_EMPTY_GENERATION_RESPONSE'
    )
  }

  return parseAIJson(
    response,
    generateMockTestQuestionsSchema
  )
}

export const evaluateMockTestOpenAnswerAI = async (
  input: EvaluateMockTestOpenAnswerAIInput
): Promise<EvaluateMockTestOpenAnswerAIOutput> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: buildMockTestAnswerEvaluationPrompt(input),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Mock test answer evaluation returned an empty response',
      'MOCK_TEST_AI_EMPTY_EVALUATION_RESPONSE'
    )
  }

  return parseAIJson(
    response,
    evaluateMockTestOpenAnswerSchema
  )
}

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
    'llama-3.1-8b-instant'
  )

  return (
    response ||
    'Keep practicing to improve your performance across all topics.'
  )
}

export const generateMockTestQuestionsGroqAI = async (
  input: GenerateMockTestQuestionsAIInput
): Promise<GenerateMockTestQuestionsAIOutput> => {
  const response = await groqChat(
    [
      {
        role: 'user',
        content: buildMockTestQuestionsPrompt(input),
      },
    ],
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Mock test question generation (Groq) returned an empty response',
      'MOCK_TEST_AI_EMPTY_GENERATION_RESPONSE'
    )
  }

  return parseAIJson(response, generateMockTestQuestionsSchema)
}
