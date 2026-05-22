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
  TrackerListFilter,
  TrackerListResult,
  TrackerRecord,
  TrackerSubtopicRecord,
  TrackerSummaryRecord,
  TrackerTopicRecord,
  UpdateSubtopicProgressInput,
  UpdateTrackerInput,
} from '../types/trackers.types'
import type { GeneratedLessonData } from '../types/lesson-practice.types'

export interface TrackerRepository {
  hasAnyTrackerForUser(userId: string): Promise<boolean>

  getTrackerSummary(
    userId: string
  ): Promise<TrackerSummaryRecord>

  listOwnedTrackers(
    filter: TrackerListFilter
  ): Promise<TrackerListResult>

  createTracker(
    data: CreateTrackerInput
  ): Promise<TrackerRecord>

  updateOwnedTracker(
    data: UpdateTrackerInput
  ): Promise<TrackerRecord | null>

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

  publishOwnedTracker(data: {
    trackerId: string
    userId: string
  }): Promise<TrackerRecord | null>

  unpublishOwnedTracker(data: {
    trackerId: string
    userId: string
  }): Promise<TrackerRecord | null>

  findEvaluationJobById(
    evaluationJobId: string,
    userId: string
  ): Promise<EvaluationJobRecord | null>

  getTopicsForTracker(
    trackerId: string
  ): Promise<TrackerTopicRecord[]>

  getSubtopicsForTracker(
    trackerId: string
  ): Promise<TrackerSubtopicRecord[]>

  getSubtopicById(data: {
    trackerId: string
    subtopicId: string
  }): Promise<TrackerSubtopicRecord | null>

  findLastTopicForTracker(
    trackerId: string
  ): Promise<LastTopicRecord | null>

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

  incrementTrackerTopicsCount(
    trackerId: string
  ): Promise<unknown>

  incrementTrackerSubtopicsCount(
    trackerId: string
  ): Promise<unknown>

  updateSubtopicProgress(
    data: UpdateSubtopicProgressInput
  ): Promise<TrackerSubtopicRecord | null>

  recomputeTrackerProgress(
    trackerId: string
  ): Promise<TrackerRecord | null>

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
  lessonType:
    | 'concept'
    | 'coding'
    | 'interview'
    | 'system_design'
    | 'theory'
  requiresCompiler: boolean
  codeExample: {
    language: string
    fileName: string
    code: string
  }
  practiceTask: {
    title: string
    description: string
    starterCode: string
  }
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
}