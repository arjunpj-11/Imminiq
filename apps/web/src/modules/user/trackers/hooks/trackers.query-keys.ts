import type { LessonCodeSubmissionAction, ITrackerListQuery } from '../types/tracker.types';

export const trackerKeys = {
  all: ['trackers'] as const,
  summary: () => [...trackerKeys.all, 'summary'] as const,
  domains: (search: string) => [...trackerKeys.all, 'domains', search] as const,
  lists: () => [...trackerKeys.all, 'list'] as const,
  list: (query: ITrackerListQuery) => [...trackerKeys.lists(), query] as const,
  details: () => [...trackerKeys.all, 'detail'] as const,
  detail: (trackerId: string) => [...trackerKeys.details(), trackerId] as const,
  roadmap: (trackerId: string) => [...trackerKeys.detail(trackerId), 'roadmap'] as const,
  clan: (trackerId: string) => [...trackerKeys.detail(trackerId), 'clan'] as const,
  clanMessages: (trackerId: string) => [...trackerKeys.clan(trackerId), 'messages'] as const,
  clanChallenges: (trackerId: string) => [...trackerKeys.clan(trackerId), 'challenges'] as const,
  contributions: (trackerId: string) =>
    [...trackerKeys.detail(trackerId), 'topic-contributions'] as const,
  lesson: (trackerId: string, subtopicId: string) =>
    [...trackerKeys.detail(trackerId), 'lesson', subtopicId] as const,
  lessonChat: (trackerId: string, subtopicId: string) =>
    [...trackerKeys.lesson(trackerId, subtopicId), 'chat'] as const,
  lessonAnswerAttempts: (trackerId: string, subtopicId: string) =>
    [...trackerKeys.lesson(trackerId, subtopicId), 'answer-attempts'] as const,
  lessonCodeSubmissions: (
    trackerId: string,
    subtopicId: string,
    action?: LessonCodeSubmissionAction
  ) => [...trackerKeys.lesson(trackerId, subtopicId), 'code-submissions', action || 'all'] as const,
  lessonGeneratedQuestions: (trackerId: string, subtopicId: string) =>
    [...trackerKeys.lesson(trackerId, subtopicId), 'generated-questions'] as const,
  lessonQuestionSolution: (trackerId: string, subtopicId: string, question: string) =>
    [...trackerKeys.lesson(trackerId, subtopicId), 'question-solution', question] as const,
  lessonQuestionSolutionDoubts: (trackerId: string, subtopicId: string, question: string) =>
    [...trackerKeys.lessonQuestionSolution(trackerId, subtopicId, question), 'doubts'] as const,
};
