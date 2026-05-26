import {
  chatWithLessonQuestionSolutionDoubt,
  chatWithLessonTutor,
  generateCodeHint,
  generateLesson,
  generateLessonPracticeQuestions,
  generateLessonQuestionSolution,
  generateLessonVisualization,
  generateOptimizedCodeSolution,
  verifyNonCodingAnswer,
  verifyTrackerSubtopic,
  verifyTrackerTopic,
} from '../../../../infrastructure/ai/ai.service'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

export const aiTrackerService: TrackerAIServiceContract = {
  generateLesson,
  chatWithLessonTutor,
  generateLessonPracticeQuestions,
  generateLessonQuestionSolution,
  chatWithLessonQuestionSolutionDoubt,
  generateLessonVisualization,
  generateCodeHint,
  generateOptimizedCodeSolution,
  verifyNonCodingAnswer,
  verifyTrackerTopic,
  verifyTrackerSubtopic,
}
