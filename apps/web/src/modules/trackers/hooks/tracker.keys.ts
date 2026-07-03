import type { LessonCodeSubmissionAction, TrackerListQuery } from '../types/tracker.types'

export const trackerKeys = {
  all: ['trackers'] as const,
  summary: () => [...trackerKeys.all, 'summary'] as const,
  lists: () => [...trackerKeys.all, 'list'] as const,
  list: (query: TrackerListQuery) => [...trackerKeys.lists(), query] as const,
  details: () => [...trackerKeys.all, 'detail'] as const,
  detail: (trackerId: string) => [...trackerKeys.details(), trackerId] as const,
  roadmap: (trackerId: string) => [...trackerKeys.detail(trackerId), 'roadmap'] as const,
  lesson: (trackerId: string, subtopicId: string) =>
    [...trackerKeys.detail(trackerId), 'lesson', subtopicId] as const,
  lessonChat: (trackerId: string, subtopicId: string) =>
    [...trackerKeys.lesson(trackerId, subtopicId), 'chat'] as const,
  lessonAnswerAttempts: (trackerId: string, subtopicId: string) =>
    [...trackerKeys.lesson(trackerId, subtopicId), 'answer-attempts'] as const,
  lessonCodeSubmissions: (
    trackerId: string,
    subtopicId: string,
    action?: LessonCodeSubmissionAction,
  ) =>
    [
      ...trackerKeys.lesson(trackerId, subtopicId),
      'code-submissions',
      action || 'all',
    ] as const,
  lessonGeneratedQuestions: (trackerId: string, subtopicId: string) =>
    [...trackerKeys.lesson(trackerId, subtopicId), 'generated-questions'] as const,
  lessonQuestionSolution: (
    trackerId: string,
    subtopicId: string,
    question: string,
  ) =>
    [
      ...trackerKeys.lesson(trackerId, subtopicId),
      'question-solution',
      question,
    ] as const,
  lessonQuestionSolutionDoubts: (
    trackerId: string,
    subtopicId: string,
    question: string,
  ) =>
    [
      ...trackerKeys.lessonQuestionSolution(trackerId, subtopicId, question),
      'doubts',
    ] as const,
}
