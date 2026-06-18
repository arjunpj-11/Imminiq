import type { AttemptStatus } from '../../domain/value-objects/attempt-status.vo'
import type { CreationSessionStatus } from '../../domain/value-objects/creation-session-status.vo'
import type { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo'
import type { EvaluationStatus } from '../../domain/value-objects/evaluation-status.vo'
import type { MockTestCodingDetails } from '../../domain/value-objects/mock-test-coding.vo'
import type { MockTestCreationDraft } from '../../domain/value-objects/mock-test-creation-draft.vo'
import type { MockTestCodingLanguage } from '../../domain/value-objects/coding-language.vo'
import type { QuestionType } from '../../domain/value-objects/question-type.vo'
import type { TestVisibility } from '../../domain/value-objects/test-visibility.vo'

export type {
  DifficultyLevel,
  MockTestCodingDetails,
  MockTestCodingLanguage,
  QuestionType,
  TestVisibility,
}

export interface MockTest {
  _id: string
  ownerId: string
  trackerId?: string
  sourceTestId?: string
  title: string
  description: string
  difficulty: DifficultyLevel
  visibility: TestVisibility
  questionCount: number
  timeLimitMinutes: number
  passingScore: number
  isAIGenerated: boolean
  tags: string[]
  shareToken?: string
  isShareEnabled: boolean
  cloneCount: number
  averageScore: number
  attemptCount: number
  createdAt: Date
  updatedAt: Date
}

export interface MockTestQuestion {
  _id: string
  testId: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer?: string
  explanation?: string
  difficulty: DifficultyLevel
  order: number
  points: number
  coding?: MockTestCodingDetails
}

export type PublicMockTestQuestion = Omit<
  MockTestQuestion,
  'correctAnswer' | 'explanation'
>

export interface MockTestAttempt {
  _id: string
  testId: string
  userId: string
  status: AttemptStatus
  startedAt: Date
  completedAt?: Date
  timeTakenSeconds?: number
  score?: number
  scorePercentage?: number
  passed?: boolean
  flaggedQuestions: string[]
  totalQuestions: number
  answeredQuestions: number
  createdAt: Date
}

export interface MockTestAnswer {
  _id: string
  attemptId: string
  questionId: string
  answer: string
  isCorrect?: boolean
  pointsEarned?: number
  aiEvaluationId?: string
  submittedAt: Date
}

export interface MockTestAIEvaluation {
  _id: string
  attemptId: string
  questionId: string
  answerId: string
  score: number
  maxScore: number
  feedback: string
  status: EvaluationStatus
  createdAt: Date
}

export interface MockTestReport {
  _id: string
  attemptId: string
  userId: string
  testId: string
  score: number
  scorePercentage: number
  passed: boolean
  timeTakenSeconds: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  skippedAnswers: number
  strongTopics: string[]
  weakTopics: string[]
  recommendations: string[]
  createdAt: Date
}

export interface MockTestCreationSession {
  _id: string
  userId: string
  status: CreationSessionStatus
  step: number
  draftData: MockTestCreationDraft
  createdAt: Date
  updatedAt: Date
}

export interface CreateMockTestPayload {
  title: string
  description?: string
  difficulty?: DifficultyLevel
  visibility?: TestVisibility
  timeLimitMinutes?: number
  passingScore?: number
  tags?: string[]
  trackerId?: string
  questions: {
    type: QuestionType
    question: string
    options?: string[]
    correctAnswer?: string
    explanation?: string
    difficulty?: DifficultyLevel
    points?: number
    coding?: MockTestCodingDetails
  }[]
}

export interface GenerateMockTestPayload {
  topic: string
  difficulty?: DifficultyLevel
  questionCount?: number
  questionTypes?: QuestionType[]
  trackerId?: string
  topicId?: string
  timeLimitMinutes?: number
  passingScore?: number
  visibility?: TestVisibility
}

export interface SubmitAnswerPayload {
  questionId: string
  answer: string
}

export interface RunMockTestCodePayload {
  sourceCode: string
  language?: MockTestCodingLanguage
  languageId?: number
}

export type SubmitMockTestCodePayload = RunMockTestCodePayload

export interface MockTestSummary {
  totalTests: number
  completedAttempts: number
  averageScore: number
  bestScore: number
  totalQuestions: number
  passedAttempts: number
}

export interface TestAttemptResult {
  attempt: MockTestAttempt
  report: MockTestReport | null
  answers: (MockTestAnswer & {
    question?: MockTestQuestion
    aiEvaluation?: MockTestAIEvaluation
  })[]
}

export interface TestAnalytics {
  trends: { date: string; averageScore: number; attempts: number }[]
  topicBreakdown: { topic: string; averageScore: number; totalAttempts: number }[]
  aiInsights: string
}

export interface AttemptAnalysis {
  score: number
  scorePercentage: number
  passed: boolean
  strongTopics: string[]
  weakTopics: string[]
  recommendations: string[]
  questionBreakdown: {
    questionId: string
    question: string
    isCorrect: boolean
    yourAnswer: string
    correctAnswer?: string
    explanation?: string
    pointsEarned: number
    maxPoints: number
  }[]
}