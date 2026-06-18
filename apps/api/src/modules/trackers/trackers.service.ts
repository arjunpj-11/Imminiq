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
import { TrackerMapper, type TrackerMapperContract } from './application/mappers/tracker.mapper'
import type { TrackerRepositoryContract } from './domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from './domain/services/tracker-ai.service.interface'
import type { CodeExecutionServiceContract } from './domain/services/code-execution.service.interface'
import type { QuestionHasherServiceContract } from './domain/services/question-hasher.service.interface'
import { aiTrackerGateway } from './infrastructure/gateways/ai-tracker.gateway'
import { pistonCodeExecutionGateway } from './infrastructure/gateways/piston-code-execution.gateway'
import { mongoTrackerRepository } from './infrastructure/repositories/mongo-tracker.repository'
import { cryptoQuestionHasherService } from './infrastructure/services/crypto-question-hasher.service'


type TrackerListInput = Parameters<ListTrackersUseCase['execute']>[0]
type CreateTrackerInput = Parameters<CreateTrackerUseCase['execute']>[0]
type UpdateTrackerInput = Parameters<UpdateTrackerUseCase['execute']>[0]
type CreateTopicInput = Parameters<CreateTrackerTopicUseCase['execute']>[0]
type CreateSubtopicInput = Parameters<CreateTrackerSubtopicUseCase['execute']>[0]
type UpdateSubtopicProgressInput = Parameters<UpdateSubtopicProgressUseCase['execute']>[0]
type ChatWithLessonTutorInput = Parameters<ChatWithLessonTutorUseCase['execute']>[0]
type GenerateLessonQuestionsInput = Parameters<GenerateLessonQuestionsUseCase['execute']>[0]
type GetLessonQuestionSolutionInput = Parameters<GetLessonQuestionSolutionUseCase['execute']>[0]
type GenerateLessonQuestionSolutionInput = Parameters<GenerateLessonQuestionSolutionUseCase['execute']>[0]
type GetLessonQuestionSolutionDoubtsInput = Parameters<GetLessonQuestionSolutionDoubtsUseCase['execute']>[0]
type AskLessonQuestionSolutionDoubtInput = Parameters<AskLessonQuestionSolutionDoubtUseCase['execute']>[0]
type VerifyLessonAnswerInput = Parameters<VerifyLessonAnswerUseCase['execute']>[0]
type RunLessonCodeInput = Parameters<RunLessonCodeUseCase['execute']>[0]
type SubmitLessonCodeInput = Parameters<SubmitLessonCodeUseCase['execute']>[0]
type GetCodeHintInput = Parameters<GetCodeHintUseCase['execute']>[0]
type GetOptimizedSolutionInput = Parameters<GetOptimizedSolutionUseCase['execute']>[0]
type ClearLessonQuestionSolutionDoubtsInput = Parameters<ClearLessonQuestionSolutionDoubtsUseCase['execute']>[0]
type VerifyTopicInput = Parameters<VerifyTrackerTopicUseCase['execute']>[0]
type VerifySubtopicInput = Parameters<VerifyTrackerSubtopicUseCase['execute']>[0]
type AddMissingEvaluationTopicInput = Parameters<AddMissingEvaluationTopicUseCase['execute']>[0]
type GenerateLessonVisualizationInput = Parameters<GenerateLessonVisualizationUseCase['execute']>[0]
type PublishTrackerInput = Parameters<PublishTrackerUseCase['execute']>[0]

export class TrackerService {
  private readonly getTrackerSummaryUseCase: GetTrackerSummaryUseCase
  private readonly listTrackersUseCase: ListTrackersUseCase
  private readonly createTrackerUseCase: CreateTrackerUseCase
  private readonly getTrackerDetailsUseCase: GetTrackerDetailsUseCase
  private readonly updateTrackerUseCase: UpdateTrackerUseCase
  private readonly deleteTrackerUseCase: DeleteTrackerUseCase
  private readonly archiveTrackerUseCase: ArchiveTrackerUseCase
  private readonly restoreTrackerUseCase: RestoreTrackerUseCase
  private readonly publishTrackerUseCase: PublishTrackerUseCase
  private readonly unpublishTrackerUseCase: UnpublishTrackerUseCase
  private readonly getTrackerRoadmapUseCase: GetTrackerRoadmapUseCase
  private readonly createTrackerTopicUseCase: CreateTrackerTopicUseCase
  private readonly createTrackerSubtopicUseCase: CreateTrackerSubtopicUseCase
  private readonly updateSubtopicProgressUseCase: UpdateSubtopicProgressUseCase
  private readonly addMissingEvaluationTopicUseCase: AddMissingEvaluationTopicUseCase
  private readonly getTrackerLessonUseCase: GetTrackerLessonUseCase
  private readonly chatWithLessonTutorUseCase: ChatWithLessonTutorUseCase
  private readonly generateLessonQuestionsUseCase: GenerateLessonQuestionsUseCase
  private readonly generateLessonQuestionSolutionUseCase: GenerateLessonQuestionSolutionUseCase
  private readonly askLessonQuestionSolutionDoubtUseCase: AskLessonQuestionSolutionDoubtUseCase
  private readonly generateLessonVisualizationUseCase: GenerateLessonVisualizationUseCase
  private readonly getCodeHintUseCase: GetCodeHintUseCase
  private readonly getOptimizedSolutionUseCase: GetOptimizedSolutionUseCase
  private readonly verifyLessonAnswerUseCase: VerifyLessonAnswerUseCase
  private readonly verifyTrackerTopicUseCase: VerifyTrackerTopicUseCase
  private readonly verifyTrackerSubtopicUseCase: VerifyTrackerSubtopicUseCase
  private readonly runLessonCodeUseCase: RunLessonCodeUseCase
  private readonly submitLessonCodeUseCase: SubmitLessonCodeUseCase
  private readonly getLessonChatHistoryUseCase: GetLessonChatHistoryUseCase
  private readonly getLessonAnswerAttemptsUseCase: GetLessonAnswerAttemptsUseCase
  private readonly getLessonCodeSubmissionsUseCase: GetLessonCodeSubmissionsUseCase
  private readonly getLessonGeneratedQuestionsUseCase: GetLessonGeneratedQuestionsUseCase
  private readonly getLessonQuestionSolutionUseCase: GetLessonQuestionSolutionUseCase
  private readonly getLessonQuestionSolutionDoubtsUseCase: GetLessonQuestionSolutionDoubtsUseCase
  private readonly clearLessonChatHistoryUseCase: ClearLessonChatHistoryUseCase
  private readonly clearLessonQuestionSolutionDoubtsUseCase: ClearLessonQuestionSolutionDoubtsUseCase

  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerAIService: TrackerAIServiceContract,
    private readonly codeExecutionService: CodeExecutionServiceContract,
    private readonly questionHasher: QuestionHasherServiceContract,
    private readonly trackerMapper: TrackerMapperContract
  ) {
    this.getTrackerSummaryUseCase = new GetTrackerSummaryUseCase(this.trackerRepository)
    this.listTrackersUseCase = new ListTrackersUseCase(this.trackerRepository)
    this.createTrackerUseCase = new CreateTrackerUseCase(this.trackerRepository)
    this.getTrackerDetailsUseCase = new GetTrackerDetailsUseCase(this.trackerRepository)
    this.updateTrackerUseCase = new UpdateTrackerUseCase(this.trackerRepository)
    this.deleteTrackerUseCase = new DeleteTrackerUseCase(this.trackerRepository)
    this.archiveTrackerUseCase = new ArchiveTrackerUseCase(this.trackerRepository)
    this.restoreTrackerUseCase = new RestoreTrackerUseCase(this.trackerRepository)
    this.publishTrackerUseCase = new PublishTrackerUseCase(this.trackerRepository)
    this.unpublishTrackerUseCase = new UnpublishTrackerUseCase(this.trackerRepository)
    this.getTrackerRoadmapUseCase = new GetTrackerRoadmapUseCase(this.trackerRepository)
    this.createTrackerTopicUseCase = new CreateTrackerTopicUseCase(this.trackerRepository)
    this.createTrackerSubtopicUseCase = new CreateTrackerSubtopicUseCase(this.trackerRepository)
    this.updateSubtopicProgressUseCase = new UpdateSubtopicProgressUseCase(this.trackerRepository)
    this.addMissingEvaluationTopicUseCase = new AddMissingEvaluationTopicUseCase(this.trackerRepository)

    this.getTrackerLessonUseCase = new GetTrackerLessonUseCase(this.trackerRepository, this.trackerAIService)
    this.chatWithLessonTutorUseCase = new ChatWithLessonTutorUseCase(this.trackerRepository, this.trackerAIService)
    this.generateLessonQuestionsUseCase = new GenerateLessonQuestionsUseCase(this.trackerRepository, this.trackerAIService, this.questionHasher)
    this.generateLessonQuestionSolutionUseCase = new GenerateLessonQuestionSolutionUseCase(this.trackerRepository, this.trackerAIService, this.questionHasher)
    this.askLessonQuestionSolutionDoubtUseCase = new AskLessonQuestionSolutionDoubtUseCase(this.trackerRepository, this.trackerAIService, this.questionHasher)
    this.generateLessonVisualizationUseCase = new GenerateLessonVisualizationUseCase(this.trackerRepository, this.trackerAIService)
    this.getCodeHintUseCase = new GetCodeHintUseCase(this.trackerRepository, this.trackerAIService)
    this.getOptimizedSolutionUseCase = new GetOptimizedSolutionUseCase(this.trackerRepository, this.trackerAIService)
    this.verifyLessonAnswerUseCase = new VerifyLessonAnswerUseCase(this.trackerRepository, this.trackerAIService)
    this.verifyTrackerTopicUseCase = new VerifyTrackerTopicUseCase(this.trackerRepository, this.trackerAIService)
    this.verifyTrackerSubtopicUseCase = new VerifyTrackerSubtopicUseCase(this.trackerRepository, this.trackerAIService)

    this.runLessonCodeUseCase = new RunLessonCodeUseCase(this.trackerRepository, this.codeExecutionService)
    this.submitLessonCodeUseCase = new SubmitLessonCodeUseCase(this.trackerRepository, this.codeExecutionService)

    this.getLessonChatHistoryUseCase = new GetLessonChatHistoryUseCase(this.trackerRepository)
    this.getLessonAnswerAttemptsUseCase = new GetLessonAnswerAttemptsUseCase(this.trackerRepository)
    this.getLessonCodeSubmissionsUseCase = new GetLessonCodeSubmissionsUseCase(this.trackerRepository)
    this.getLessonGeneratedQuestionsUseCase = new GetLessonGeneratedQuestionsUseCase(this.trackerRepository)
    this.getLessonQuestionSolutionUseCase = new GetLessonQuestionSolutionUseCase(this.trackerRepository, this.questionHasher)
    this.getLessonQuestionSolutionDoubtsUseCase = new GetLessonQuestionSolutionDoubtsUseCase(this.trackerRepository, this.questionHasher)
    this.clearLessonChatHistoryUseCase = new ClearLessonChatHistoryUseCase(this.trackerRepository)
    this.clearLessonQuestionSolutionDoubtsUseCase = new ClearLessonQuestionSolutionDoubtsUseCase(this.trackerRepository, this.questionHasher)
  }

  hasAnyTrackerForUser(userId: string) {
    return this.trackerRepository.hasAnyTrackerForUser(userId)
  }

  async getSummary(userId: string) {
    const summary = await this.getTrackerSummaryUseCase.execute(userId)
    return this.trackerMapper.toTrackerSummaryDto(summary)
  }

  async listTrackers(filter: TrackerListInput) {
    const result = await this.listTrackersUseCase.execute(filter)
    return this.trackerMapper.toTrackerListDto(result)
  }

  async createTracker(input: CreateTrackerInput) {
    const tracker = await this.createTrackerUseCase.execute(input)
    return this.trackerMapper.toTrackerDto(tracker)
  }

  async getTrackerDetails(input: { trackerId: string; userId: string }) {
    const tracker = await this.getTrackerDetailsUseCase.execute(input)
    return this.trackerMapper.toTrackerDetailsDto(tracker)
  }

  async updateTracker(input: UpdateTrackerInput) {
    const tracker = await this.updateTrackerUseCase.execute(input)
    return this.trackerMapper.toTrackerDto(tracker)
  }

  deleteTracker(input: { trackerId: string; userId: string }) {
    return this.deleteTrackerUseCase.execute(input)
  }

  async archiveTracker(input: { trackerId: string; userId: string }) {
    const tracker = await this.archiveTrackerUseCase.execute(input)
    return this.trackerMapper.toTrackerDto(tracker)
  }

  async restoreTracker(input: { trackerId: string; userId: string }) {
    const tracker = await this.restoreTrackerUseCase.execute(input)
    return this.trackerMapper.toTrackerDto(tracker)
  }

  async publishTracker(input: PublishTrackerInput) {
    const tracker = await this.publishTrackerUseCase.execute(input)
    return this.trackerMapper.toTrackerDto(tracker)
  }

  async unpublishTracker(input: { trackerId: string; userId: string }) {
    const tracker = await this.unpublishTrackerUseCase.execute(input)
    return this.trackerMapper.toTrackerDto(tracker)
  }

  async getRoadmap(input: { trackerId: string; userId: string }) {
    const roadmap = await this.getTrackerRoadmapUseCase.execute(input)
    return this.trackerMapper.toTrackerRoadmapDto(roadmap)
  }

  async createTopic(input: CreateTopicInput) {
    const topic = await this.createTrackerTopicUseCase.execute(input)
    return this.trackerMapper.toTrackerTopicDto(topic)
  }

  async createSubtopic(input: CreateSubtopicInput) {
    const subtopic = await this.createTrackerSubtopicUseCase.execute(input)
    return this.trackerMapper.toTrackerSubtopicDto(subtopic)
  }

  async updateSubtopicProgress(input: UpdateSubtopicProgressInput) {
    const result = await this.updateSubtopicProgressUseCase.execute(input)
    return this.trackerMapper.toSubtopicProgressResultDto(result)
  }

  async getLesson(input: { trackerId: string; subtopicId: string; userId: string }) {
    const lesson = await this.getTrackerLessonUseCase.execute(input)
    return this.trackerMapper.toGeneratedLessonDto(lesson)
  }

  async getLessonChatHistory(input: { trackerId: string; subtopicId: string; userId: string }) {
    const history = await this.getLessonChatHistoryUseCase.execute(input)
    return this.trackerMapper.toLessonChatHistoryDto(history)
  }

  async chatWithLessonTutor(input: ChatWithLessonTutorInput) {
    const response = await this.chatWithLessonTutorUseCase.execute(input)
    return this.trackerMapper.toLessonTutorChatResponseDto(response)
  }

  async getLessonGeneratedQuestions(input: { trackerId: string; subtopicId: string; userId: string }) {
    const questions = await this.getLessonGeneratedQuestionsUseCase.execute(input)
    return this.trackerMapper.toLessonGeneratedQuestionsDto(questions)
  }

  async generateLessonQuestions(input: GenerateLessonQuestionsInput) {
    const questions = await this.generateLessonQuestionsUseCase.execute(input)
    return this.trackerMapper.toLessonGeneratedQuestionsDto(questions)
  }

  async getLessonQuestionSolution(input: GetLessonQuestionSolutionInput) {
    const solution = await this.getLessonQuestionSolutionUseCase.execute(input)
    return this.trackerMapper.toLessonQuestionSolutionDto(solution)
  }

  async generateLessonQuestionSolution(input: GenerateLessonQuestionSolutionInput) {
    const solution = await this.generateLessonQuestionSolutionUseCase.execute(input)
    return this.trackerMapper.toLessonQuestionSolutionDto(solution)
  }

  async getLessonQuestionSolutionDoubts(input: GetLessonQuestionSolutionDoubtsInput) {
    const doubts = await this.getLessonQuestionSolutionDoubtsUseCase.execute(input)
    return this.trackerMapper.toLessonQuestionSolutionDoubtsDto(doubts)
  }

  async askLessonQuestionSolutionDoubt(input: AskLessonQuestionSolutionDoubtInput) {
    const answer = await this.askLessonQuestionSolutionDoubtUseCase.execute(input)
    return this.trackerMapper.toLessonQuestionSolutionDoubtAnswerDto(answer)
  }

  async getLessonAnswerAttempts(input: { trackerId: string; subtopicId: string; userId: string }) {
    const attempts = await this.getLessonAnswerAttemptsUseCase.execute(input)
    return this.trackerMapper.toLessonAnswerAttemptsDto(attempts)
  }

  async verifyLessonAnswer(input: VerifyLessonAnswerInput) {
    const result = await this.verifyLessonAnswerUseCase.execute(input)
    return this.trackerMapper.toLessonAnswerVerificationDto(result)
  }

  async getLessonCodeSubmissions(input: {
    trackerId: string
    subtopicId: string
    userId: string
    action?: 'run' | 'submit'
  }) {
    const submissions = await this.getLessonCodeSubmissionsUseCase.execute(input)
    return this.trackerMapper.toLessonCodeSubmissionsDto(submissions)
  }

  async runLessonCode(input: RunLessonCodeInput) {
    const result = await this.runLessonCodeUseCase.execute(input)
    return this.trackerMapper.toLessonCodeExecutionDto(result)
  }

  async submitLessonCode(input: SubmitLessonCodeInput) {
    const result = await this.submitLessonCodeUseCase.execute(input)
    return this.trackerMapper.toLessonCodeExecutionDto(result)
  }

  async getCodeHint(input: GetCodeHintInput) {
    const hint = await this.getCodeHintUseCase.execute(input)
    return this.trackerMapper.toLessonCodeHintDto(hint)
  }

  async getOptimizedSolution(input: GetOptimizedSolutionInput) {
    const solution = await this.getOptimizedSolutionUseCase.execute(input)
    return this.trackerMapper.toLessonOptimizedSolutionDto(solution)
  }

  async clearLessonChatHistory(input: { trackerId: string; subtopicId: string; userId: string }) {
    const result = await this.clearLessonChatHistoryUseCase.execute(input)
    return this.trackerMapper.toClearLessonHistoryResultDto(result)
  }

  async clearLessonQuestionSolutionDoubts(input: ClearLessonQuestionSolutionDoubtsInput) {
    const result = await this.clearLessonQuestionSolutionDoubtsUseCase.execute(input)
    return this.trackerMapper.toClearLessonHistoryResultDto(result)
  }

  async verifyTopic(input: VerifyTopicInput) {
    const result = await this.verifyTrackerTopicUseCase.execute(input)
    return this.trackerMapper.toTrackerAIValidationDto(result)
  }

  async verifySubtopic(input: VerifySubtopicInput) {
    const result = await this.verifyTrackerSubtopicUseCase.execute(input)
    return this.trackerMapper.toTrackerAIValidationDto(result)
  }

  async addMissingEvaluationTopic(input: AddMissingEvaluationTopicInput) {
    const result = await this.addMissingEvaluationTopicUseCase.execute(input)
    return this.trackerMapper.toAddMissingEvaluationTopicDto(result)
  }

  async generateLessonVisualization(input: GenerateLessonVisualizationInput) {
    const visualization = await this.generateLessonVisualizationUseCase.execute(input)
    return this.trackerMapper.toLessonVisualizationDto(visualization)
  }
}

export const trackerService = new TrackerService(
  mongoTrackerRepository,
  aiTrackerGateway,
  pistonCodeExecutionGateway,
  cryptoQuestionHasherService,
  new TrackerMapper()
)
