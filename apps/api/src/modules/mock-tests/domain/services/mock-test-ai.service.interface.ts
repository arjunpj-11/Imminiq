import {
  DifficultyLevel,
  QuestionType,
  MockTestCodingDetails,
} from '../types/mock-tests.types'

export interface GenerateQuestionsInput {
  topic: string
  difficulty: DifficultyLevel
  questionCount: number
  questionTypes: QuestionType[]
}

export interface EvaluateAnswerInput {
  question: string
  correctAnswer?: string
  userAnswer: string
  questionType: QuestionType
  maxPoints: number
}

export interface EvaluateAnswerOutput {
  score: number
  feedback: string
  isCorrect: boolean
}

export interface GenerateInsightsInput {
  userId: string
  performanceTrends: object[]
  topicBreakdown: object[]
}

export type GeneratedMockTestQuestion = {
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer?: string
  explanation?: string
  difficulty: DifficultyLevel
  points: number
  coding?: MockTestCodingDetails
}

export interface MockTestAIServiceContract {
  generateQuestions(input: GenerateQuestionsInput): Promise<{
    title: string
    description: string
    questions: GeneratedMockTestQuestion[]
  }>

  evaluateOpenAnswer(input: EvaluateAnswerInput): Promise<EvaluateAnswerOutput>

  generatePerformanceInsights(input: GenerateInsightsInput): Promise<string>
}