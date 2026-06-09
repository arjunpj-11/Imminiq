export type QuestionType = 'mcq' | 'short_answer' | 'coding'
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type TestVisibility = 'private' | 'public'
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'
export type EvaluationStatus = 'pending' | 'completed' | 'failed'

export type MockTestCodingLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'c'

export type MockTestCodingValueType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'number[]'
  | 'string[]'
  | 'boolean[]'
  | 'number[][]'
  | 'string[][]'

export interface MockTestCodingTestCase {
  input: unknown[]
  expectedOutput: unknown
  isHidden: boolean
  explanation?: string
}

export interface MockTestCodingDetails {
  functionName: string
  language: MockTestCodingLanguage
  inputTypes: MockTestCodingValueType[]
  outputType: MockTestCodingValueType
  starterCode: string
  templates?: Partial<Record<MockTestCodingLanguage, string>>
  testCases: MockTestCodingTestCase[]
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
  createdAt: string
  updatedAt: string
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

export interface PublicMockTestQuestion {
  _id: string
  type: QuestionType
  question: string
  options?: string[]
  difficulty: DifficultyLevel
  order: number
  points: number
  coding?: MockTestCodingDetails
}

export interface MockTestShareResponse {
  shareToken: string
  shareUrl: string
}

export interface ImportSharedMockTestResponse {
  test: MockTest
  imported: boolean
  alreadyImported: boolean
}

export interface MockTestAttempt {
  _id: string
  testId: string
  userId: string
  status: AttemptStatus
  startedAt: string
  completedAt?: string
  timeTakenSeconds?: number
  score?: number
  scorePercentage?: number
  passed?: boolean
  flaggedQuestions: string[]
  totalQuestions: number
  answeredQuestions: number
  createdAt: string
}

export interface MockTestAnswer {
  _id: string
  attemptId: string
  questionId: string
  answer: string
  isCorrect?: boolean
  pointsEarned?: number
  aiEvaluationId?: string
  submittedAt: string
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
  createdAt: string
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
  createdAt: string
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

export interface MockTestPagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ListMockTestsResponse {
  summary: MockTestSummary
  tests: MockTestListItem[]
  pagination?: MockTestPagination
}

export interface MockTestDetailsResponse {
  test: MockTest
  questions: PublicMockTestQuestion[]
  latestAttempt?: MockTestAttempt | null
}

export interface StartAttemptResponse {
  attempt: MockTestAttempt
  questions: PublicMockTestQuestion[]
}

export interface AttemptResultResponse {
  attempt: MockTestAttempt
  report: MockTestReport | null
  answers: Array<
    MockTestAnswer & {
      question?: MockTestQuestion
      aiEvaluation?: MockTestAIEvaluation
    }
  >
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

export interface TestAnalytics {
  trends: {
    date: string
    averageScore: number
    attempts: number
  }[]
  topicBreakdown: {
    topic: string
    averageScore: number
    totalAttempts: number
  }[]
  aiInsights: string
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
  language: MockTestCodingLanguage
  languageId: number
}

export interface SubmitMockTestCodePayload {
  sourceCode: string
  language: MockTestCodingLanguage
  languageId: number
}

export interface MockTestCodeCaseResult {
  index: number
  input: unknown[]
  expectedOutput: unknown
  actualOutput: unknown
  passed: boolean
  isHidden: boolean
  error?: string
  explanation?: string
}

export interface MockTestCodeRunResponse {
  passed: boolean
  passedCount: number
  totalCount: number
  testCases: MockTestCodeCaseResult[]
  stdout: string
  stderr: string
  compileOutput: string
  message: string
  status: {
    id: number
    description: string
  }
}

export interface MockTestCodeSubmitResponse extends MockTestCodeRunResponse {
  answer: MockTestAnswer | null
  isCorrect: boolean
  pointsEarned: number
  maxPoints: number
  feedback: string
}

export interface ApiResponse<T> {
  statusCode?: number
  message: string
  data: T
  success?: boolean
}