import { DifficultyLevel, QuestionType } from '../types/mock-tests.types'

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

export interface EvaluateAnswerOutput { score: number; feedback: string; isCorrect: boolean }
export interface GenerateInsightsInput { userId: string; performanceTrends: object[]; topicBreakdown: object[] }

export interface MockTestAIServiceContract {
  generateQuestions(input: GenerateQuestionsInput): Promise<{
    title: string
    description: string
    questions: { type: QuestionType; question: string; options?: string[]; correctAnswer?: string; explanation?: string; difficulty: DifficultyLevel; points: number }[]
  }>
  evaluateOpenAnswer(input: EvaluateAnswerInput): Promise<EvaluateAnswerOutput>
  generatePerformanceInsights(input: GenerateInsightsInput): Promise<string>
}
