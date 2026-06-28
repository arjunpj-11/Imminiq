import {
  createTrackerComposition,
  type AddMissingEvaluationTopicInput,
  type AskLessonQuestionSolutionDoubtInput,
  type ChatWithLessonTutorInput,
  type ClearLessonQuestionSolutionDoubtsInput,
  type CreateSubtopicInput,
  type CreateTopicInput,
  type CreateTrackerInput,
  type GenerateLessonQuestionSolutionInput,
  type GenerateLessonQuestionsInput,
  type GenerateLessonVisualizationInput,
  type GetCodeHintInput,
  type GetLessonQuestionSolutionDoubtsInput,
  type GetLessonQuestionSolutionInput,
  type GetOptimizedSolutionInput,
  type PublishTrackerInput,
  type RunLessonCodeInput,
  type SubmitLessonCodeInput,
  type TrackerComposition,
  type TrackerListInput,
  type UpdateSubtopicProgressInput,
  type UpdateTrackerInput,
  type VerifyLessonAnswerInput,
  type VerifySubtopicInput,
  type VerifyTopicInput,
} from './tracker.factory'

export class TrackerService {
  private readonly _useCases: TrackerComposition['useCases']
  private readonly _helpers: TrackerComposition['helpers']

  constructor(composition: TrackerComposition) {
    this._useCases = composition.useCases
    this._helpers = composition.helpers
  }

  hasAnyTrackerForUser(userId: string) {
    return this._helpers.trackerRepository.hasAnyTrackerForUser(userId)
  }

  getSummary(userId: string) {
    return this._useCases.getTrackerSummary.execute(userId)
  }

  listTrackers(filter: TrackerListInput) {
    return this._useCases.listTrackers.execute(filter)
  }

  createTracker(input: CreateTrackerInput) {
    return this._useCases.createTracker.execute(input)
  }

  getTrackerDetails(input: { trackerId: string; userId: string }) {
    return this._useCases.getTrackerDetails.execute(input)
  }

  updateTracker(input: UpdateTrackerInput) {
    return this._useCases.updateTracker.execute(input)
  }

  deleteTracker(input: { trackerId: string; userId: string }) {
    return this._useCases.deleteTracker.execute(input)
  }

  archiveTracker(input: { trackerId: string; userId: string }) {
    return this._useCases.archiveTracker.execute(input)
  }

  restoreTracker(input: { trackerId: string; userId: string }) {
    return this._useCases.restoreTracker.execute(input)
  }

  publishTracker(input: PublishTrackerInput) {
    return this._useCases.publishTracker.execute(input)
  }

  unpublishTracker(input: { trackerId: string; userId: string }) {
    return this._useCases.unpublishTracker.execute(input)
  }

  getRoadmap(input: { trackerId: string; userId: string }) {
    return this._useCases.getTrackerRoadmap.execute(input)
  }

  createTopic(input: CreateTopicInput) {
    return this._useCases.createTrackerTopic.execute(input)
  }

  createSubtopic(input: CreateSubtopicInput) {
    return this._useCases.createTrackerSubtopic.execute(input)
  }

  updateSubtopicProgress(input: UpdateSubtopicProgressInput) {
    return this._useCases.updateSubtopicProgress.execute(input)
  }

  getLesson(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this._useCases.getTrackerLesson.execute(input)
  }

  getLessonChatHistory(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this._useCases.getLessonChatHistory.execute(input)
  }

  chatWithLessonTutor(input: ChatWithLessonTutorInput) {
    return this._useCases.chatWithLessonTutor.execute(input)
  }

  getLessonGeneratedQuestions(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this._useCases.getLessonGeneratedQuestions.execute(input)
  }

  generateLessonQuestions(input: GenerateLessonQuestionsInput) {
    return this._useCases.generateLessonQuestions.execute(input)
  }

  getLessonQuestionSolution(input: GetLessonQuestionSolutionInput) {
    return this._useCases.getLessonQuestionSolution.execute(input)
  }

  generateLessonQuestionSolution(
    input: GenerateLessonQuestionSolutionInput
  ) {
    return this._useCases.generateLessonQuestionSolution.execute(input)
  }

  getLessonQuestionSolutionDoubts(
    input: GetLessonQuestionSolutionDoubtsInput
  ) {
    return this._useCases.getLessonQuestionSolutionDoubts.execute(input)
  }

  askLessonQuestionSolutionDoubt(
    input: AskLessonQuestionSolutionDoubtInput
  ) {
    return this._useCases.askLessonQuestionSolutionDoubt.execute(input)
  }

  getLessonAnswerAttempts(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this._useCases.getLessonAnswerAttempts.execute(input)
  }

  verifyLessonAnswer(input: VerifyLessonAnswerInput) {
    return this._useCases.verifyLessonAnswer.execute(input)
  }

  getLessonCodeSubmissions(input: {
    trackerId: string
    subtopicId: string
    userId: string
    action?: 'run' | 'submit'
  }) {
    return this._useCases.getLessonCodeSubmissions.execute(input)
  }

  runLessonCode(input: RunLessonCodeInput) {
    return this._useCases.runLessonCode.execute(input)
  }

  submitLessonCode(input: SubmitLessonCodeInput) {
    return this._useCases.submitLessonCode.execute(input)
  }

  getCodeHint(input: GetCodeHintInput) {
    return this._useCases.getCodeHint.execute(input)
  }

  getOptimizedSolution(input: GetOptimizedSolutionInput) {
    return this._useCases.getOptimizedSolution.execute(input)
  }

  clearLessonChatHistory(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this._useCases.clearLessonChatHistory.execute(input)
  }

  clearLessonQuestionSolutionDoubts(
    input: ClearLessonQuestionSolutionDoubtsInput
  ) {
    return this._useCases.clearLessonQuestionSolutionDoubts.execute(input)
  }

  verifyTopic(input: VerifyTopicInput) {
    return this._useCases.verifyTrackerTopic.execute(input)
  }

  verifySubtopic(input: VerifySubtopicInput) {
    return this._useCases.verifyTrackerSubtopic.execute(input)
  }

  addMissingEvaluationTopic(input: AddMissingEvaluationTopicInput) {
    return this._useCases.addMissingEvaluationTopic.execute(input)
  }

  generateLessonVisualization(input: GenerateLessonVisualizationInput) {
    return this._useCases.generateLessonVisualization.execute(input)
  }
}

export const trackerService = new TrackerService(
  createTrackerComposition()
)