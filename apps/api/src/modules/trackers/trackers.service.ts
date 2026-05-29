import { mongoTrackerRepository } from './infrastructure/repositories/mongo-tracker.repository'
import { aiTrackerService } from './infrastructure/gateways/ai-tracker.service'
import { pistonCodeExecutionService } from './infrastructure/gateways/piston-code-execution.service'

import { AddMissingEvaluationTopicUseCase } from './application/use-cases/add-missing-evaluation-topic.usecase'
import { ArchiveTrackerUseCase } from './application/use-cases/archive-tracker.usecase'
import { AskLessonQuestionSolutionDoubtUseCase } from './application/use-cases/ask-lesson-question-solution-doubt.usecase'
import { ChatWithLessonTutorUseCase } from './application/use-cases/chat-with-lesson-tutor.usecase'
import { ClearLessonChatHistoryUseCase } from './application/use-cases/clear-lesson-chat-history.usecase'
import { ClearLessonQuestionSolutionDoubtsUseCase } from './application/use-cases/clear-lesson-question-solution-doubts.usecase'
import { CreateTrackerSubtopicUseCase } from './application/use-cases/create-tracker-subtopic.usecase'
import { CreateTrackerTopicUseCase } from './application/use-cases/create-tracker-topic.usecase'
import { CreateTrackerUseCase } from './application/use-cases/create-tracker.usecase'
import { DeleteTrackerUseCase } from './application/use-cases/delete-tracker.usecase'
import { GenerateLessonQuestionSolutionUseCase } from './application/use-cases/generate-lesson-question-solution.usecase'
import { GenerateLessonQuestionsUseCase } from './application/use-cases/generate-lesson-questions.usecase'
import { GenerateLessonVisualizationUseCase } from './application/use-cases/generate-lesson-visualization.usecase'
import { GetCodeHintUseCase } from './application/use-cases/get-code-hint.usecase'
import { GetLessonAnswerAttemptsUseCase } from './application/use-cases/get-lesson-answer-attempts.usecase'
import { GetLessonChatHistoryUseCase } from './application/use-cases/get-lesson-chat-history.usecase'
import { GetLessonCodeSubmissionsUseCase } from './application/use-cases/get-lesson-code-submissions.usecase'
import { GetLessonGeneratedQuestionsUseCase } from './application/use-cases/get-lesson-generated-questions.usecase'
import { GetLessonQuestionSolutionDoubtsUseCase } from './application/use-cases/get-lesson-question-solution-doubts.usecase'
import { GetLessonQuestionSolutionUseCase } from './application/use-cases/get-lesson-question-solution.usecase'
import { GetOptimizedSolutionUseCase } from './application/use-cases/get-optimized-solution.usecase'
import { GetTrackerDetailsUseCase } from './application/use-cases/get-tracker-details.usecase'
import { GetTrackerLessonUseCase } from './application/use-cases/get-tracker-lesson.usecase'
import { GetTrackerRoadmapUseCase } from './application/use-cases/get-tracker-roadmap.usecase'
import { GetTrackerSummaryUseCase } from './application/use-cases/get-tracker-summary.usecase'
import { ListTrackersUseCase } from './application/use-cases/list-trackers.usecase'
import { PublishTrackerUseCase } from './application/use-cases/publish-tracker.usecase'
import { RestoreTrackerUseCase } from './application/use-cases/restore-tracker.usecase'
import { RunLessonCodeUseCase } from './application/use-cases/run-lesson-code.usecase'
import { SubmitLessonCodeUseCase } from './application/use-cases/submit-lesson-code.usecase'
import { UnpublishTrackerUseCase } from './application/use-cases/unpublish-tracker.usecase'
import { UpdateSubtopicProgressUseCase } from './application/use-cases/update-subtopic-progress.usecase'
import { UpdateTrackerUseCase } from './application/use-cases/update-tracker.usecase'
import { VerifyLessonAnswerUseCase } from './application/use-cases/verify-lesson-answer.usecase'
import { VerifyTrackerSubtopicUseCase } from './application/use-cases/verify-tracker-subtopic.usecase'
import { VerifyTrackerTopicUseCase } from './application/use-cases/verify-tracker-topic.usecase'

const trackerRepository = mongoTrackerRepository

const getTrackerSummaryUseCase = new GetTrackerSummaryUseCase(trackerRepository)
const listTrackersUseCase = new ListTrackersUseCase(trackerRepository)
const createTrackerUseCase = new CreateTrackerUseCase(trackerRepository)
const getTrackerDetailsUseCase = new GetTrackerDetailsUseCase(trackerRepository)
const updateTrackerUseCase = new UpdateTrackerUseCase(trackerRepository)
const deleteTrackerUseCase = new DeleteTrackerUseCase(trackerRepository)
const archiveTrackerUseCase = new ArchiveTrackerUseCase(trackerRepository)
const restoreTrackerUseCase = new RestoreTrackerUseCase(trackerRepository)
const publishTrackerUseCase = new PublishTrackerUseCase(trackerRepository)
const unpublishTrackerUseCase = new UnpublishTrackerUseCase(trackerRepository)
const getTrackerRoadmapUseCase = new GetTrackerRoadmapUseCase(trackerRepository)
const createTrackerTopicUseCase = new CreateTrackerTopicUseCase(trackerRepository)
const createTrackerSubtopicUseCase = new CreateTrackerSubtopicUseCase(trackerRepository)
const updateSubtopicProgressUseCase = new UpdateSubtopicProgressUseCase(trackerRepository)
const addMissingEvaluationTopicUseCase = new AddMissingEvaluationTopicUseCase(trackerRepository)

const getTrackerLessonUseCase = new GetTrackerLessonUseCase(trackerRepository, aiTrackerService)
const chatWithLessonTutorUseCase = new ChatWithLessonTutorUseCase(trackerRepository, aiTrackerService)
const generateLessonQuestionsUseCase = new GenerateLessonQuestionsUseCase(trackerRepository, aiTrackerService)
const generateLessonQuestionSolutionUseCase = new GenerateLessonQuestionSolutionUseCase(trackerRepository, aiTrackerService)
const askLessonQuestionSolutionDoubtUseCase = new AskLessonQuestionSolutionDoubtUseCase(trackerRepository, aiTrackerService)
const generateLessonVisualizationUseCase = new GenerateLessonVisualizationUseCase(trackerRepository, aiTrackerService)
const getCodeHintUseCase = new GetCodeHintUseCase(trackerRepository, aiTrackerService)
const getOptimizedSolutionUseCase = new GetOptimizedSolutionUseCase(trackerRepository, aiTrackerService)
const verifyLessonAnswerUseCase = new VerifyLessonAnswerUseCase(trackerRepository, aiTrackerService)
const verifyTrackerTopicUseCase = new VerifyTrackerTopicUseCase(trackerRepository, aiTrackerService)
const verifyTrackerSubtopicUseCase = new VerifyTrackerSubtopicUseCase(trackerRepository, aiTrackerService)

const runLessonCodeUseCase = new RunLessonCodeUseCase(trackerRepository, pistonCodeExecutionService)
const submitLessonCodeUseCase = new SubmitLessonCodeUseCase(trackerRepository, pistonCodeExecutionService)

const getLessonChatHistoryUseCase = new GetLessonChatHistoryUseCase(trackerRepository)
const getLessonAnswerAttemptsUseCase = new GetLessonAnswerAttemptsUseCase(trackerRepository)
const getLessonCodeSubmissionsUseCase = new GetLessonCodeSubmissionsUseCase(trackerRepository)
const getLessonGeneratedQuestionsUseCase = new GetLessonGeneratedQuestionsUseCase(trackerRepository)
const getLessonQuestionSolutionUseCase = new GetLessonQuestionSolutionUseCase(trackerRepository)
const getLessonQuestionSolutionDoubtsUseCase = new GetLessonQuestionSolutionDoubtsUseCase(trackerRepository)
const clearLessonChatHistoryUseCase = new ClearLessonChatHistoryUseCase(trackerRepository)
const clearLessonQuestionSolutionDoubtsUseCase = new ClearLessonQuestionSolutionDoubtsUseCase(trackerRepository)

type TrackerListInput = Parameters<typeof listTrackersUseCase.execute>[0]
type CreateTrackerInput = Parameters<typeof createTrackerUseCase.execute>[0]
type UpdateTrackerInput = Parameters<typeof updateTrackerUseCase.execute>[0]
type CreateTopicInput = Parameters<typeof createTrackerTopicUseCase.execute>[0]
type CreateSubtopicInput = Parameters<typeof createTrackerSubtopicUseCase.execute>[0]
type UpdateSubtopicProgressInput = Parameters<typeof updateSubtopicProgressUseCase.execute>[0]
type ChatWithLessonTutorInput = Parameters<typeof chatWithLessonTutorUseCase.execute>[0]
type GenerateLessonQuestionsInput = Parameters<typeof generateLessonQuestionsUseCase.execute>[0]
type GetLessonQuestionSolutionInput = Parameters<typeof getLessonQuestionSolutionUseCase.execute>[0]
type GenerateLessonQuestionSolutionInput = Parameters<typeof generateLessonQuestionSolutionUseCase.execute>[0]
type GetLessonQuestionSolutionDoubtsInput = Parameters<typeof getLessonQuestionSolutionDoubtsUseCase.execute>[0]
type AskLessonQuestionSolutionDoubtInput = Parameters<typeof askLessonQuestionSolutionDoubtUseCase.execute>[0]
type VerifyLessonAnswerInput = Parameters<typeof verifyLessonAnswerUseCase.execute>[0]
type RunLessonCodeInput = Parameters<typeof runLessonCodeUseCase.execute>[0]
type SubmitLessonCodeInput = Parameters<typeof submitLessonCodeUseCase.execute>[0]
type GetCodeHintInput = Parameters<typeof getCodeHintUseCase.execute>[0]
type GetOptimizedSolutionInput = Parameters<typeof getOptimizedSolutionUseCase.execute>[0]
type ClearLessonQuestionSolutionDoubtsInput = Parameters<typeof clearLessonQuestionSolutionDoubtsUseCase.execute>[0]
type VerifyTopicInput = Parameters<typeof verifyTrackerTopicUseCase.execute>[0]
type VerifySubtopicInput = Parameters<typeof verifyTrackerSubtopicUseCase.execute>[0]
type AddMissingEvaluationTopicInput = Parameters<typeof addMissingEvaluationTopicUseCase.execute>[0]
type GenerateLessonVisualizationInput = Parameters<typeof generateLessonVisualizationUseCase.execute>[0]
type PublishTrackerInput = Parameters<typeof publishTrackerUseCase.execute>[0]


export const trackerService = {
  hasAnyTrackerForUser: (userId: string) =>
    trackerRepository.hasAnyTrackerForUser(userId),

  getSummary: (userId: string) =>
    getTrackerSummaryUseCase.execute(userId),

  listTrackers: (filter: TrackerListInput) =>
    listTrackersUseCase.execute(filter),

  createTracker: (input: CreateTrackerInput) =>
    createTrackerUseCase.execute(input),

  getTrackerDetails: (input: { trackerId: string; userId: string }) =>
    getTrackerDetailsUseCase.execute(input),

  updateTracker: (input: UpdateTrackerInput) =>
    updateTrackerUseCase.execute(input),

  deleteTracker: (input: { trackerId: string; userId: string }) =>
    deleteTrackerUseCase.execute(input),

  archiveTracker: (input: { trackerId: string; userId: string }) =>
    archiveTrackerUseCase.execute(input),

  restoreTracker: (input: { trackerId: string; userId: string }) =>
    restoreTrackerUseCase.execute(input),

publishTracker: (input: PublishTrackerInput) =>
  publishTrackerUseCase.execute(input),

  unpublishTracker: (input: { trackerId: string; userId: string }) =>
    unpublishTrackerUseCase.execute(input),

  getRoadmap: (input: { trackerId: string; userId: string }) =>
    getTrackerRoadmapUseCase.execute(input),

  createTopic: (input: CreateTopicInput) =>
    createTrackerTopicUseCase.execute(input),

  createSubtopic: (input: CreateSubtopicInput) =>
    createTrackerSubtopicUseCase.execute(input),

  updateSubtopicProgress: (input: UpdateSubtopicProgressInput) =>
    updateSubtopicProgressUseCase.execute(input),

  getLesson: (input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) =>
    getTrackerLessonUseCase.execute(input),

  getLessonChatHistory: (input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) =>
    getLessonChatHistoryUseCase.execute(input),

  chatWithLessonTutor: (input: ChatWithLessonTutorInput) =>
    chatWithLessonTutorUseCase.execute(input),

  getLessonGeneratedQuestions: (input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) =>
    getLessonGeneratedQuestionsUseCase.execute(input),

  generateLessonQuestions: (input: GenerateLessonQuestionsInput) =>
    generateLessonQuestionsUseCase.execute(input),

  getLessonQuestionSolution: (input: GetLessonQuestionSolutionInput) =>
    getLessonQuestionSolutionUseCase.execute(input),

  generateLessonQuestionSolution: (
    input: GenerateLessonQuestionSolutionInput
  ) =>
    generateLessonQuestionSolutionUseCase.execute(input),

  getLessonQuestionSolutionDoubts: (
    input: GetLessonQuestionSolutionDoubtsInput
  ) =>
    getLessonQuestionSolutionDoubtsUseCase.execute(input),

  askLessonQuestionSolutionDoubt: (
    input: AskLessonQuestionSolutionDoubtInput
  ) =>
    askLessonQuestionSolutionDoubtUseCase.execute(input),

  getLessonAnswerAttempts: (input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) =>
    getLessonAnswerAttemptsUseCase.execute(input),

  verifyLessonAnswer: (input: VerifyLessonAnswerInput) =>
    verifyLessonAnswerUseCase.execute(input),

  getLessonCodeSubmissions: (input: {
    trackerId: string
    subtopicId: string
    userId: string
    action?: 'run' | 'submit'
  }) =>
    getLessonCodeSubmissionsUseCase.execute(input),

  runLessonCode: (input: RunLessonCodeInput) =>
    runLessonCodeUseCase.execute(input),

  submitLessonCode: (input: SubmitLessonCodeInput) =>
    submitLessonCodeUseCase.execute(input),

  getCodeHint: (input: GetCodeHintInput) =>
    getCodeHintUseCase.execute(input),

  getOptimizedSolution: (input: GetOptimizedSolutionInput) =>
    getOptimizedSolutionUseCase.execute(input),

  clearLessonChatHistory: (input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) =>
    clearLessonChatHistoryUseCase.execute(input),

  clearLessonQuestionSolutionDoubts: (
    input: ClearLessonQuestionSolutionDoubtsInput
  ) =>
    clearLessonQuestionSolutionDoubtsUseCase.execute(input),

  verifyTopic: (input: VerifyTopicInput) =>
    verifyTrackerTopicUseCase.execute(input),

  verifySubtopic: (input: VerifySubtopicInput) =>
    verifyTrackerSubtopicUseCase.execute(input),

  addMissingEvaluationTopic: (input: AddMissingEvaluationTopicInput) =>
    addMissingEvaluationTopicUseCase.execute(input),

  generateLessonVisualization: (input: GenerateLessonVisualizationInput) =>
    generateLessonVisualizationUseCase.execute(input),
}
