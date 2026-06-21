import type { GeneratedLessonPracticeTask } from '../types/lesson-practice.types'
import type { GeneratedTrackerLessonRecord } from '../types/trackers.types'

export type TrackerLessonType =
  | 'concept'
  | 'coding'
  | 'interview'
  | 'system_design'
  | 'theory'

export type TrackerLessonCompilerRuntime =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'c++'
  | 'c'
  | 'java'
  | null

export type TrackerLessonDifficulty =
  | 'beginner'
  | 'intermediate'
  | 'advanced'

export type TrackerLessonCodeExample = {
  language: string
  fileName: string
  code: string
}

export type CreateTrackerLessonInput = {
  trackerId: string
  subtopicId: string
  userId: string
  title: string
  summary: string
  explanation: string
  insight: string
  lessonType: TrackerLessonType
  compilerRuntime: TrackerLessonCompilerRuntime
  codeExample: TrackerLessonCodeExample
  practiceTask: GeneratedLessonPracticeTask
  tags: string[]
  difficulty: TrackerLessonDifficulty
  estimatedMinutes: number
}

export type LessonChatScope =
  | 'lesson_doubt_chat'
  | 'question_solution_chat'

export type GetLessonChatMessagesInput = {
  trackerId: string
  subtopicId: string
  userId: string
  scope?: LessonChatScope
  questionId?: string | null
}

export type CreateLessonChatMessageInput = {
  trackerId: string
  subtopicId: string
  userId: string
  lessonId?: string | null
  scope?: LessonChatScope
  questionId?: string | null
  role: 'user' | 'assistant'
  content: string
}

export type GetLessonAnswerAttemptsInput = {
  trackerId: string
  subtopicId: string
  userId: string
  questionId?: string | null
}

export type CreateLessonAnswerAttemptInput = {
  trackerId: string
  subtopicId: string
  userId: string
  lessonId?: string | null
  questionId?: string | null
  question: string
  answer: string
  feedback: unknown
  isCorrect: boolean
  score: number
}

export type LessonCodeAction = 'run' | 'submit'

export type GetLessonCodeSubmissionsInput = {
  trackerId: string
  subtopicId: string
  userId: string
  action?: LessonCodeAction
}

export type CreateLessonCodeSubmissionInput = {
  trackerId: string
  subtopicId: string
  userId: string
  lessonId?: string | null
  questionId?: string | null
  action: LessonCodeAction
  language: string
  languageId?: number | null
  sourceCode: string
  stdin?: string
  stdout?: string
  stderr?: string
  compileOutput?: string
  message?: string
  status?: unknown
  time?: string | null
  memory?: number | null
  isCorrect?: boolean
  expectedOutput?: string
  actualOutput?: string
  feedback?: string
}

export type GetLessonGeneratedQuestionsInput = {
  trackerId: string
  subtopicId: string
  userId: string
}

export type LessonGeneratedQuestionInput = {
  question: string
  questionHash: string
  source?: 'base' | 'ai_generated'
}

export type CreateLessonGeneratedQuestionsInput = {
  trackerId: string
  subtopicId: string
  userId: string
  lessonId?: string | null
  questions: LessonGeneratedQuestionInput[]
}

export type FindLessonQuestionSolutionInput = {
  trackerId: string
  subtopicId: string
  userId: string
  questionHash: string
}

export type CreateLessonQuestionSolutionInput = {
  trackerId: string
  subtopicId: string
  userId: string
  lessonId?: string | null
  question: string
  questionHash: string
  solution: string
}

export type GetLessonQuestionSolutionDoubtsInput = {
  trackerId: string
  subtopicId: string
  userId: string
  questionHash: string
}

export type CreateLessonQuestionSolutionDoubtInput = {
  trackerId: string
  subtopicId: string
  userId: string
  lessonId?: string | null
  solutionId?: string | null
  question: string
  questionHash: string
  role: 'user' | 'assistant'
  content: string
}

export type ClearLessonChatMessagesInput = {
  trackerId: string
  subtopicId: string
  userId: string
}

export type ClearLessonQuestionSolutionDoubtsInput = {
  trackerId: string
  subtopicId: string
  userId: string
  questionHash: string
}

export type FindLessonVisualizationInput = {
  trackerId: string
  subtopicId: string
  userId: string
}

export type LessonVisualizationRecord = {
  html: string
  visualTitle: string
  visualDescription: string
}

export type SaveLessonVisualizationInput = {
  trackerId: string
  subtopicId: string
  userId: string
  lessonId?: string | null
  html: string
  visualTitle: string
  visualDescription: string
}

export interface TrackerLessonRepositoryContract {
  createLesson(
    data: CreateTrackerLessonInput
  ): Promise<GeneratedTrackerLessonRecord>

  getLessonChatMessages(data: GetLessonChatMessagesInput): Promise<unknown[]>

  createLessonChatMessage(data: CreateLessonChatMessageInput): Promise<unknown>

  getLessonAnswerAttempts(
    data: GetLessonAnswerAttemptsInput
  ): Promise<unknown[]>

  createLessonAnswerAttempt(
    data: CreateLessonAnswerAttemptInput
  ): Promise<unknown>

  getLessonCodeSubmissions(
    data: GetLessonCodeSubmissionsInput
  ): Promise<unknown[]>

  createLessonCodeSubmission(
    data: CreateLessonCodeSubmissionInput
  ): Promise<unknown>

  getLessonGeneratedQuestions(
    data: GetLessonGeneratedQuestionsInput
  ): Promise<unknown[]>

  createLessonGeneratedQuestions(
    data: CreateLessonGeneratedQuestionsInput
  ): Promise<unknown[]>

  findLessonQuestionSolution(
    data: FindLessonQuestionSolutionInput
  ): Promise<unknown | null>

  createLessonQuestionSolution(
    data: CreateLessonQuestionSolutionInput
  ): Promise<unknown>

  getLessonQuestionSolutionDoubts(
    data: GetLessonQuestionSolutionDoubtsInput
  ): Promise<unknown[]>

  createLessonQuestionSolutionDoubt(
    data: CreateLessonQuestionSolutionDoubtInput
  ): Promise<unknown>

  clearLessonChatMessages(data: ClearLessonChatMessagesInput): Promise<unknown>

  clearLessonQuestionSolutionDoubts(
    data: ClearLessonQuestionSolutionDoubtsInput
  ): Promise<unknown>

  findLessonVisualization(
    data: FindLessonVisualizationInput
  ): Promise<LessonVisualizationRecord | null>

  saveLessonVisualization(data: SaveLessonVisualizationInput): Promise<unknown>
}