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
  private readonly useCases: TrackerComposition['useCases']
  private readonly helpers: TrackerComposition['helpers']

  constructor(composition: TrackerComposition) {
    this.useCases = composition.useCases
    this.helpers = composition.helpers
  }

  hasAnyTrackerForUser(userId: string) {
    return this.helpers.trackerRepository.hasAnyTrackerForUser(userId)
  }

  getSummary(userId: string) {
    return this.useCases.getTrackerSummary.execute(userId)
  }

  listTrackers(filter: TrackerListInput) {
    return this.useCases.listTrackers.execute(filter)
  }

  createTracker(input: CreateTrackerInput) {
    return this.useCases.createTracker.execute(input)
  }

  getTrackerDetails(input: { trackerId: string; userId: string }) {
    return this.useCases.getTrackerDetails.execute(input)
  }

  updateTracker(input: UpdateTrackerInput) {
    return this.useCases.updateTracker.execute(input)
  }

  deleteTracker(input: { trackerId: string; userId: string }) {
    return this.useCases.deleteTracker.execute(input)
  }

  archiveTracker(input: { trackerId: string; userId: string }) {
    return this.useCases.archiveTracker.execute(input)
  }

  restoreTracker(input: { trackerId: string; userId: string }) {
    return this.useCases.restoreTracker.execute(input)
  }

  publishTracker(input: PublishTrackerInput) {
    return this.useCases.publishTracker.execute(input)
  }

  unpublishTracker(input: { trackerId: string; userId: string }) {
    return this.useCases.unpublishTracker.execute(input)
  }

  getRoadmap(input: { trackerId: string; userId: string }) {
    return this.useCases.getTrackerRoadmap.execute(input)
  }

  createTopic(input: CreateTopicInput) {
    return this.useCases.createTrackerTopic.execute(input)
  }

  createSubtopic(input: CreateSubtopicInput) {
    return this.useCases.createTrackerSubtopic.execute(input)
  }

  updateSubtopicProgress(input: UpdateSubtopicProgressInput) {
    return this.useCases.updateSubtopicProgress.execute(input)
  }

  getLesson(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this.useCases.getTrackerLesson.execute(input)
  }

  getLessonChatHistory(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this.useCases.getLessonChatHistory.execute(input)
  }

  chatWithLessonTutor(input: ChatWithLessonTutorInput) {
    return this.useCases.chatWithLessonTutor.execute(input)
  }

  getLessonGeneratedQuestions(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this.useCases.getLessonGeneratedQuestions.execute(input)
  }

  generateLessonQuestions(input: GenerateLessonQuestionsInput) {
    return this.useCases.generateLessonQuestions.execute(input)
  }

  getLessonQuestionSolution(input: GetLessonQuestionSolutionInput) {
    return this.useCases.getLessonQuestionSolution.execute(input)
  }

  generateLessonQuestionSolution(
    input: GenerateLessonQuestionSolutionInput
  ) {
    return this.useCases.generateLessonQuestionSolution.execute(input)
  }

  getLessonQuestionSolutionDoubts(
    input: GetLessonQuestionSolutionDoubtsInput
  ) {
    return this.useCases.getLessonQuestionSolutionDoubts.execute(input)
  }

  askLessonQuestionSolutionDoubt(
    input: AskLessonQuestionSolutionDoubtInput
  ) {
    return this.useCases.askLessonQuestionSolutionDoubt.execute(input)
  }

  getLessonAnswerAttempts(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this.useCases.getLessonAnswerAttempts.execute(input)
  }

  verifyLessonAnswer(input: VerifyLessonAnswerInput) {
    return this.useCases.verifyLessonAnswer.execute(input)
  }

  getLessonCodeSubmissions(input: {
    trackerId: string
    subtopicId: string
    userId: string
    action?: 'run' | 'submit'
  }) {
    return this.useCases.getLessonCodeSubmissions.execute(input)
  }

  runLessonCode(input: RunLessonCodeInput) {
    return this.useCases.runLessonCode.execute(input)
  }

  submitLessonCode(input: SubmitLessonCodeInput) {
    return this.useCases.submitLessonCode.execute(input)
  }

  getCodeHint(input: GetCodeHintInput) {
    return this.useCases.getCodeHint.execute(input)
  }

  getOptimizedSolution(input: GetOptimizedSolutionInput) {
    return this.useCases.getOptimizedSolution.execute(input)
  }

  clearLessonChatHistory(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    return this.useCases.clearLessonChatHistory.execute(input)
  }

  clearLessonQuestionSolutionDoubts(
    input: ClearLessonQuestionSolutionDoubtsInput
  ) {
    return this.useCases.clearLessonQuestionSolutionDoubts.execute(input)
  }

  verifyTopic(input: VerifyTopicInput) {
    return this.useCases.verifyTrackerTopic.execute(input)
  }

  verifySubtopic(input: VerifySubtopicInput) {
    return this.useCases.verifyTrackerSubtopic.execute(input)
  }

  addMissingEvaluationTopic(input: AddMissingEvaluationTopicInput) {
    return this.useCases.addMissingEvaluationTopic.execute(input)
  }

  generateLessonVisualization(input: GenerateLessonVisualizationInput) {
    return this.useCases.generateLessonVisualization.execute(input)
  }
}

export const trackerService = new TrackerService(
  createTrackerComposition()
)