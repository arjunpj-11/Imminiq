import type {
  CreateTrackerInput,
  CreateTrackerTopicInput,
  CreateTrackerSubtopicInput,
  CreatedTrackerTopicRecord,
  CreatedTrackerSubtopicRecord,
  EvaluationJobRecord,
  GeneratedTrackerLessonRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
  PublishTrackerInput,
  SubtopicWithProgressRecord,
  TrackerListFilter,
  TrackerListResult,
  TrackerProgressRecord,
  TrackerRecord,
  TrackerSubtopicRecord,
  TrackerSummaryRecord,
  TrackerTopicRecord,
  UpdateSubtopicProgressInput,
  UpdateTrackerInput,
  UserSubtopicProgressRecord,
  UserTopicProgressRecord,
  TopicWithProgressRecord,
} from '../types/trackers.types'

import type { GeneratedLessonData, GeneratedLessonPracticeTask } from '../types/lesson-practice.types'

export interface TrackerRepositoryContract {
  // ─── Tracker CRUD ────────────────────────────────────────────────────────────

  hasAnyTrackerForUser(userId: string): Promise<boolean>

  getTrackerSummary(userId: string): Promise<TrackerSummaryRecord>

  listOwnedTrackers(filter: TrackerListFilter): Promise<TrackerListResult>

  createTracker(data: CreateTrackerInput): Promise<TrackerRecord>

  updateOwnedTracker(data: UpdateTrackerInput): Promise<TrackerRecord | null>

  softDeleteOwnedTracker(data: {
    trackerId: string
    userId: string
  }): Promise<TrackerRecord | null>

  findOwnedTrackerById(
    trackerId: string,
    userId: string
  ): Promise<TrackerRecord | null>

  archiveOwnedTracker(data: {
    trackerId: string
    userId: string
  }): Promise<TrackerRecord | null>

  restoreOwnedTracker(data: {
    trackerId: string
    userId: string
  }): Promise<TrackerRecord | null>

  publishOwnedTracker(data: PublishTrackerInput): Promise<TrackerRecord | null>

  unpublishOwnedTracker(data: {
    trackerId: string
    userId: string
  }): Promise<TrackerRecord | null>

  // ─── Topics & Subtopics (content) ─────────────────────────────────────────

  findEvaluationJobById(
    evaluationJobId: string,
    userId: string
  ): Promise<EvaluationJobRecord | null>

  getTopicsForTracker(trackerId: string): Promise<TrackerTopicRecord[]>

  getTopicsWithUserProgress(data: {
  trackerId: string
  userId: string
}): Promise<TopicWithProgressRecord[]>

  // Content only — no progress fields
  getSubtopicsForTracker(trackerId: string): Promise<TrackerSubtopicRecord[]>

  // Content merged with this user's progress
  getSubtopicsWithUserProgress(data: {
    trackerId: string
    userId: string
  }): Promise<SubtopicWithProgressRecord[]>

  getSubtopicById(data: {
    trackerId: string
    subtopicId: string
  }): Promise<TrackerSubtopicRecord | null>

  findLastTopicForTracker(trackerId: string): Promise<LastTopicRecord | null>

  shiftTopicOrdersFrom(data: {
    trackerId: string
    fromOrder: number
  }): Promise<unknown>

  createTrackerTopic(
    data: CreateTrackerTopicInput
  ): Promise<CreatedTrackerTopicRecord>

  findLastSiblingSubtopic(data: {
    topicId: string
    parentSubtopicId: string | null
  }): Promise<LastSiblingSubtopicRecord | null>

  createTrackerSubtopic(
    data: CreateTrackerSubtopicInput
  ): Promise<CreatedTrackerSubtopicRecord>

  incrementTrackerTopicsCount(trackerId: string): Promise<unknown>

  incrementTrackerSubtopicsCount(trackerId: string): Promise<unknown>

  // ─── User Progress ────────────────────────────────────────────────────────

  // Lazily creates UserSubtopicProgress + UserTopicProgress + TrackerProgress
  // for a user the first time they access a tracker
  ensureUserProgressInitialized(data: {
    userId: string
    trackerId: string
  }): Promise<void>

  getUserSubtopicsProgress(data: {
    userId: string
    trackerId: string
  }): Promise<UserSubtopicProgressRecord[]>

  getUserTopicsProgress(data: {
    userId: string
    trackerId: string
  }): Promise<UserTopicProgressRecord[]>

  updateSubtopicProgress(
    data: UpdateSubtopicProgressInput
  ): Promise<SubtopicWithProgressRecord | null>

  unlockNextSubtopic(data: {
    trackerId: string
    topicId: string
    completedSubtopicOrder: number
    parentSubtopicId: string | null
    userId: string
  }): Promise<unknown>

  checkAndCompleteParentSubtopic(input: {
    trackerId: string
    topicId: string
    parentSubtopicId: string
    userId: string
  }): Promise<unknown>

  checkAndCompleteTopicAndUnlockNext(input: {
    trackerId: string
    topicId: string
    userId: string
  }): Promise<unknown>

  recomputeTrackerProgress(
    trackerId: string,
    userId: string
  ): Promise<TrackerProgressRecord | null>

  // ─── Lessons ──────────────────────────────────────────────────────────────

  findLessonBySubtopicId(data: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<GeneratedTrackerLessonRecord | null>

  createLesson(data: {
    trackerId: string
    subtopicId: string
    userId: string
    title: string
    summary: string
    explanation: string
    insight: string
    lessonType: 'concept' | 'coding' | 'interview' | 'system_design' | 'theory'
   compilerRuntime: 'javascript' | 'typescript' | 'python' | 'c++' | 'c' | 'java' | null
    codeExample: { language: string; fileName: string; code: string }
    practiceTask: GeneratedLessonPracticeTask
    tags: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedMinutes: number
  }): Promise<GeneratedTrackerLessonRecord>

  markMissingEvaluationTopicAsAdded(data: {
    evaluationJobId: string
    topicIndex: number
    addedSubtopicId?: string
    addedTopicId?: string
  }): Promise<unknown>

  findGeneratedLessonBySubtopic(data: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<GeneratedLessonData | null>

  getLessonChatMessages(data: {
    trackerId: string
    subtopicId: string
    userId: string
    scope?: 'lesson_doubt_chat' | 'question_solution_chat'
    questionId?: string | null
  }): Promise<unknown[]>

  createLessonChatMessage(data: {
    trackerId: string
    subtopicId: string
    userId: string
    lessonId?: string | null
    scope?: 'lesson_doubt_chat' | 'question_solution_chat'
    questionId?: string | null
    role: 'user' | 'assistant'
    content: string
  }): Promise<unknown>

  getLessonAnswerAttempts(data: {
    trackerId: string
    subtopicId: string
    userId: string
    questionId?: string | null
  }): Promise<unknown[]>

  createLessonAnswerAttempt(data: {
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
  }): Promise<unknown>

  getLessonCodeSubmissions(data: {
    trackerId: string
    subtopicId: string
    userId: string
    action?: 'run' | 'submit'
  }): Promise<unknown[]>

  createLessonCodeSubmission(data: {
    trackerId: string
    subtopicId: string
    userId: string
    lessonId?: string | null
    questionId?: string | null
    action: 'run' | 'submit'
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
  }): Promise<unknown>

    getLessonGeneratedQuestions(data: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<unknown[]>

  createLessonGeneratedQuestions(data: {
    trackerId: string
    subtopicId: string
    userId: string
    lessonId?: string | null
    questions: {
      question: string
      questionHash: string
      source?: 'base' | 'ai_generated'
    }[]
  }): Promise<unknown[]>

  findLessonQuestionSolution(data: {
    trackerId: string
    subtopicId: string
    userId: string
    questionHash: string
  }): Promise<unknown | null>

  createLessonQuestionSolution(data: {
    trackerId: string
    subtopicId: string
    userId: string
    lessonId?: string | null
    question: string
    questionHash: string
    solution: string
  }): Promise<unknown>

  getLessonQuestionSolutionDoubts(data: {
    trackerId: string
    subtopicId: string
    userId: string
    questionHash: string
  }): Promise<unknown[]>

  createLessonQuestionSolutionDoubt(data: {
    trackerId: string
    subtopicId: string
    userId: string
    lessonId?: string | null
    solutionId?: string | null
    question: string
    questionHash: string
    role: 'user' | 'assistant'
    content: string
  }): Promise<unknown>

  clearLessonChatMessages(data: {
  trackerId: string
  subtopicId: string
  userId: string
}): Promise<unknown>

clearLessonQuestionSolutionDoubts(data: {
  trackerId: string
  subtopicId: string
  userId: string
  questionHash: string
}): Promise<unknown>

findLessonVisualization(data: {
  trackerId: string
  subtopicId: string
  userId: string
}): Promise<{
  html: string
  visualTitle: string
  visualDescription: string
} | null>
 
saveLessonVisualization(data: {
  trackerId: string
  subtopicId: string
  userId: string
  lessonId?: string | null
  html: string
  visualTitle: string
  visualDescription: string
}): Promise<unknown>
 

}

