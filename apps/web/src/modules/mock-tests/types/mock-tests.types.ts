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

export interface IMockTestCodingTestCase {
  input: unknown[]
  expectedOutput: unknown
  isHidden: boolean
  explanation?: string
}

export interface IMockTestCodingDetails {
  functionName: string
  language: MockTestCodingLanguage
  inputTypes: MockTestCodingValueType[]
  outputType: MockTestCodingValueType
  starterCode: string
  templates?: Partial<Record<MockTestCodingLanguage, string>>
  testCases: IMockTestCodingTestCase[]
}

export interface IMockTest {
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

export interface IMockTestQuestion {
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
  coding?: IMockTestCodingDetails
}

export interface IPublicMockTestQuestion {
  _id: string
  type: QuestionType
  question: string
  options?: string[]
  difficulty: DifficultyLevel
  order: number
  points: number
  coding?: IMockTestCodingDetails
}

export interface IMockTestShareResponse {
  shareToken: string
  shareUrl: string
}

export interface IImportSharedMockTestResponse {
  test: IMockTest
  imported: boolean
  alreadyImported: boolean
}

export interface IMockTestAttempt {
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

export interface IMockTestAnswer {
  _id: string
  attemptId: string
  questionId: string
  answer: string
  isCorrect?: boolean
  pointsEarned?: number
  aiEvaluationId?: string
  submittedAt: string
}

export interface IMockTestAIEvaluation {
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

export interface IMockTestReport {
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

export interface IMockTestListItem extends IMockTest {
  latestAttempt?: IMockTestAttempt | null
}

export interface IMockTestSummary {
  totalTests: number
  completedAttempts: number
  averageScore: number
  bestScore: number
  totalQuestions: number
  passedAttempts: number
}

export interface IMockTestPagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface IListMockTestsResponse {
  summary: IMockTestSummary
  tests: IMockTestListItem[]
  pagination?: IMockTestPagination
}

export interface IMockTestDetailsResponse {
  test: IMockTest
  questions: IPublicMockTestQuestion[]
  latestAttempt?: IMockTestAttempt | null
}

export interface IStartAttemptResponse {
  attempt: IMockTestAttempt
  questions: IPublicMockTestQuestion[]
}

export interface IAttemptResultResponse {
  attempt: IMockTestAttempt
  report: IMockTestReport | null
  answers: Array<
    IMockTestAnswer & {
      question?: IMockTestQuestion
      aiEvaluation?: IMockTestAIEvaluation
    }
  >
}

export interface IAttemptAnalysis {
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

export interface ITestAnalytics {
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

export interface ICreateMockTestPayload {
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
    coding?: IMockTestCodingDetails
  }[]
}

export interface IGenerateMockTestPayload {
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

export interface ISubmitAnswerPayload {
  questionId: string
  answer: string
}

export interface IRunMockTestCodePayload {
  sourceCode: string
  language: MockTestCodingLanguage
  languageId: number
}

export interface ISubmitMockTestCodePayload {
  sourceCode: string
  language: MockTestCodingLanguage
  languageId: number
}

export interface IMockTestCodeCaseResult {
  index: number
  input: unknown[]
  expectedOutput: unknown
  actualOutput: unknown
  passed: boolean
  isHidden: boolean
  error?: string
  explanation?: string
}

export interface IMockTestCodeRunResponse {
  passed: boolean
  passedCount: number
  totalCount: number
  testCases: IMockTestCodeCaseResult[]
  stdout: string
  stderr: string
  compileOutput: string
  message: string
  status: {
    id: number
    description: string
  }
}

export interface IMockTestCodeSubmitResponse extends IMockTestCodeRunResponse {
  answer: IMockTestAnswer | null
  isCorrect: boolean
  pointsEarned: number
  maxPoints: number
  feedback: string
}

export interface IApiResponse<T> {
  statusCode?: number
  message: string
  data: T
  success?: boolean
}