export type QuestionType = 'mcq' | 'short_answer' | 'coding'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type TestVisibility = 'private' | 'public'
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'
export type EvaluationStatus = 'pending' | 'completed' | 'failed'
export type CreationSessionStatus = 'draft' | 'completed' | 'cancelled'

export interface MockTest {
  _id: string
  ownerId: string
  trackerId?: string
  title: string
  description: string
  difficulty: DifficultyLevel
  visibility: TestVisibility
  questionCount: number
  timeLimitMinutes: number
  passingScore: number
  isAIGenerated: boolean
  tags: string[]
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
}

export type PublicMockTestQuestion = Omit<MockTestQuestion, 'correctAnswer' | 'explanation'>

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

export interface MockTestAnalyticsSnapshot {
  _id: string
  testId: string
  totalAttempts: number
  averageScore: number
  passRate: number
  averageTimeTakenSeconds: number
  topicBreakdown: { topic: string; averageScore: number; attemptCount: number }[]
  createdAt: Date
}

export interface MockTestCreationSession {
  _id: string
  userId: string
  status: CreationSessionStatus
  step: number
  draftData: {
    title?: string
    description?: string
    difficulty?: DifficultyLevel
    questionCount?: number
    timeLimitMinutes?: number
    passingScore?: number
    tags?: string[]
    trackerId?: string
    topicId?: string
    visibility?: TestVisibility
    questionTypes?: QuestionType[]
  }
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

export interface SubmitAnswerPayload { questionId: string; answer: string }

export interface TestAttemptResult {
  attempt: MockTestAttempt
  report: MockTestReport | null
  answers: (MockTestAnswer & { question?: MockTestQuestion; aiEvaluation?: MockTestAIEvaluation })[]
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

export interface MockTestListItem extends MockTest {
  latestAttempt?: MockTestAttempt | null
}

export interface MockTestSummary {
  totalTests: number
  completedAttempts: number
  averageScore: number
  bestScore: number
  totalQuestions: number
  passedAttempts: number
}
