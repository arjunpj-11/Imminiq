import type { TrackerRepositoryContract } from './tracker.repository.interface'

export type TrackerLessonRepositoryContract = Pick<
  TrackerRepositoryContract,
  | 'createLesson'
  | 'getLessonChatMessages'
  | 'createLessonChatMessage'
  | 'getLessonAnswerAttempts'
  | 'createLessonAnswerAttempt'
  | 'getLessonCodeSubmissions'
  | 'createLessonCodeSubmission'
  | 'getLessonGeneratedQuestions'
  | 'createLessonGeneratedQuestions'
  | 'findLessonQuestionSolution'
  | 'createLessonQuestionSolution'
  | 'getLessonQuestionSolutionDoubts'
  | 'createLessonQuestionSolutionDoubt'
  | 'clearLessonChatMessages'
  | 'clearLessonQuestionSolutionDoubts'
  | 'findLessonVisualization'
  | 'saveLessonVisualization'
>