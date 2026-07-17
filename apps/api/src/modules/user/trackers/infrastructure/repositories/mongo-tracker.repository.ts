import type {
  ArchiveOwnedTrackerInput,
  CheckAndCompleteParentSubtopicInput,
  CheckAndCompleteTopicAndUnlockNextInput,
  ClearLessonChatMessagesInput,
  ClearLessonQuestionSolutionDoubtsInput,
  CreateLessonAnswerAttemptInput,
  CreateLessonChatMessageInput,
  CreateLessonCodeSubmissionInput,
  CreateLessonGeneratedQuestionsInput,
  CreateLessonQuestionSolutionDoubtInput,
  CreateLessonQuestionSolutionInput,
  CreateTrackerLessonInput,
  EnsureUserProgressInitializedInput,
  FindEvaluationJobByIdInput,
  FindGeneratedLessonBySubtopicInput,
  FindLastSiblingSubtopicInput,
  FindLessonBySubtopicIdInput,
  FindLessonQuestionSolutionInput,
  FindLessonVisualizationInput,
  FindOwnedTrackerByIdInput,
  GetLessonAnswerAttemptsInput,
  GetLessonChatMessagesInput,
  GetLessonCodeSubmissionsInput,
  GetLessonGeneratedQuestionsInput,
  GetLessonQuestionSolutionDoubtsInput,
  GetSubtopicByIdInput,
  GetSubtopicsWithUserProgressInput,
  GetTopicsWithUserProgressInput,
  GetUserSubtopicsProgressInput,
  GetUserTopicsProgressInput,
  MarkMissingEvaluationTopicAsAddedInput,
  RecomputeTrackerProgressInput,
  RestoreOwnedTrackerInput,
  SaveLessonVisualizationInput,
  ShiftTopicOrdersFromInput,
  SoftDeleteOwnedTrackerInput,
  ITrackerRepository,
  UnpublishOwnedTrackerInput,
  UnlockNextSubtopicInput,
} from '../../domain/repositories/tracker.repository.interface';
import type {
  CreateTrackerInput,
  CreateTrackerSubtopicInput,
  CreateTrackerTopicInput,
  PublishTrackerInput,
  TrackerListFilter,
  UpdateSubtopicProgressInput,
  UpdateTrackerInput,
} from '../../domain/trackers.types';
import { MongoTrackerContentRepository } from './internal/mongo-tracker-content.repository';
import { MongoTrackerLessonRepository } from './internal/mongo-tracker-lesson.repository';
import { MongoTrackerManagementRepository } from './internal/mongo-tracker-management.repository';
import { MongoTrackerProgressRepository } from './internal/mongo-tracker-progress.repository';
import { MongoTrackerMapper } from './shared/mongo-tracker.mapper';

type MongoTrackerRepositoryDependencies = {
  managementRepository: MongoTrackerManagementRepository;
  contentRepository: MongoTrackerContentRepository;
  progressRepository: MongoTrackerProgressRepository;
  lessonRepository: MongoTrackerLessonRepository;
};

export class MongoTrackerRepository implements ITrackerRepository {
  private readonly _managementRepository: MongoTrackerManagementRepository;
  private readonly _contentRepository: MongoTrackerContentRepository;
  private readonly _progressRepository: MongoTrackerProgressRepository;
  private readonly _lessonRepository: MongoTrackerLessonRepository;

  constructor(
    mapper: MongoTrackerMapper = new MongoTrackerMapper(),
    dependencies: Partial<MongoTrackerRepositoryDependencies> = {}
  ) {
    this._managementRepository =
      dependencies.managementRepository ?? new MongoTrackerManagementRepository(mapper);

    this._contentRepository =
      dependencies.contentRepository ?? new MongoTrackerContentRepository(mapper);

    this._progressRepository =
      dependencies.progressRepository ?? new MongoTrackerProgressRepository(mapper);

    this._lessonRepository =
      dependencies.lessonRepository ?? new MongoTrackerLessonRepository(mapper);
  }

  async hasAnyTrackerForUser(userId: string) {
    return this._managementRepository.hasAnyTrackerForUser(userId);
  }

  async listDomains(search: string, limit: number) {
    return this._managementRepository.listDomains(search, limit);
  }

  async getTrackerSummary(userId: string) {
    return this._managementRepository.getTrackerSummary(userId);
  }

  async listOwnedTrackers(filter: TrackerListFilter) {
    return this._managementRepository.listOwnedTrackers(filter);
  }

  async findReportableTrackerById(trackerId: string) {
    return this._managementRepository.findReportableTrackerById(trackerId);
  }

  async createOrReopenTrackerReport(input: {
    trackerId: string;
    reporterId: string;
    reason: string;
    details: string;
  }) {
    return this._managementRepository.createOrReopenTrackerReport(input);
  }

  async createTracker(data: CreateTrackerInput) {
    return this._managementRepository.createTracker(data);
  }

  async updateOwnedTracker(data: UpdateTrackerInput) {
    return this._managementRepository.updateOwnedTracker(data);
  }

  async softDeleteOwnedTracker(data: SoftDeleteOwnedTrackerInput) {
    return this._managementRepository.softDeleteOwnedTracker(data);
  }

  async findOwnedTrackerById(data: FindOwnedTrackerByIdInput) {
    return this._managementRepository.findOwnedTrackerById(data);
  }

  async archiveOwnedTracker(data: ArchiveOwnedTrackerInput) {
    return this._managementRepository.archiveOwnedTracker(data);
  }

  async restoreOwnedTracker(data: RestoreOwnedTrackerInput) {
    return this._managementRepository.restoreOwnedTracker(data);
  }

  async publishOwnedTracker(data: PublishTrackerInput) {
    return this._managementRepository.publishOwnedTracker(data);
  }

  async unpublishOwnedTracker(data: UnpublishOwnedTrackerInput) {
    return this._managementRepository.unpublishOwnedTracker(data);
  }

  findEvaluationJobById(data: FindEvaluationJobByIdInput) {
    return this._contentRepository.findEvaluationJobById(data);
  }

  getTopicsForTracker(trackerId: string) {
    return this._contentRepository.getTopicsForTracker(trackerId);
  }

  getSubtopicsForTracker(trackerId: string) {
    return this._contentRepository.getSubtopicsForTracker(trackerId);
  }

  getSubtopicById(data: GetSubtopicByIdInput) {
    return this._contentRepository.getSubtopicById(data);
  }

  findLastTopicForTracker(trackerId: string) {
    return this._contentRepository.findLastTopicForTracker(trackerId);
  }

  shiftTopicOrdersFrom(data: ShiftTopicOrdersFromInput) {
    return this._contentRepository.shiftTopicOrdersFrom(data);
  }

  createTrackerTopic(data: CreateTrackerTopicInput) {
    return this._contentRepository.createTrackerTopic(data);
  }

  findLastSiblingSubtopic(data: FindLastSiblingSubtopicInput) {
    return this._contentRepository.findLastSiblingSubtopic(data);
  }

  createTrackerSubtopic(data: CreateTrackerSubtopicInput) {
    return this._contentRepository.createTrackerSubtopic(data);
  }

  incrementTrackerTopicsCount(trackerId: string) {
    return this._contentRepository.incrementTrackerTopicsCount(trackerId);
  }

  incrementTrackerSubtopicsCount(trackerId: string) {
    return this._contentRepository.incrementTrackerSubtopicsCount(trackerId);
  }

  markMissingEvaluationTopicAsAdded(data: MarkMissingEvaluationTopicAsAddedInput) {
    return this._contentRepository.markMissingEvaluationTopicAsAdded(data);
  }

  ensureUserProgressInitialized(data: EnsureUserProgressInitializedInput) {
    return this._progressRepository.ensureUserProgressInitialized(data);
  }

  getUserSubtopicsProgress(data: GetUserSubtopicsProgressInput) {
    return this._progressRepository.getUserSubtopicsProgress(data);
  }

  getUserTopicsProgress(data: GetUserTopicsProgressInput) {
    return this._progressRepository.getUserTopicsProgress(data);
  }

  getSubtopicsWithUserProgress(data: GetSubtopicsWithUserProgressInput) {
    return this._progressRepository.getSubtopicsWithUserProgress(data);
  }

  getTopicsWithUserProgress(data: GetTopicsWithUserProgressInput) {
    return this._progressRepository.getTopicsWithUserProgress(data);
  }

  updateSubtopicProgress(data: UpdateSubtopicProgressInput) {
    return this._progressRepository.updateSubtopicProgress(data);
  }

  unlockNextSubtopic(data: UnlockNextSubtopicInput) {
    return this._progressRepository.unlockNextSubtopic(data);
  }

  checkAndCompleteParentSubtopic(data: CheckAndCompleteParentSubtopicInput) {
    return this._progressRepository.checkAndCompleteParentSubtopic(data);
  }

  checkAndCompleteTopicAndUnlockNext(data: CheckAndCompleteTopicAndUnlockNextInput) {
    return this._progressRepository.checkAndCompleteTopicAndUnlockNext(data);
  }

  recomputeTrackerProgress(data: RecomputeTrackerProgressInput) {
    return this._progressRepository.recomputeTrackerProgress(data);
  }

  findLessonBySubtopicId(data: FindLessonBySubtopicIdInput) {
    return this._lessonRepository.findLessonBySubtopicId(data);
  }

  createLesson(data: CreateTrackerLessonInput) {
    return this._lessonRepository.createLesson(data);
  }

  getLessonChatMessages(data: GetLessonChatMessagesInput) {
    return this._lessonRepository.getLessonChatMessages(data);
  }

  createLessonChatMessage(data: CreateLessonChatMessageInput) {
    return this._lessonRepository.createLessonChatMessage(data);
  }

  clearLessonChatMessages(data: ClearLessonChatMessagesInput) {
    return this._lessonRepository.clearLessonChatMessages(data);
  }

  getLessonAnswerAttempts(data: GetLessonAnswerAttemptsInput) {
    return this._lessonRepository.getLessonAnswerAttempts(data);
  }

  createLessonAnswerAttempt(data: CreateLessonAnswerAttemptInput) {
    return this._lessonRepository.createLessonAnswerAttempt(data);
  }

  getLessonCodeSubmissions(data: GetLessonCodeSubmissionsInput) {
    return this._lessonRepository.getLessonCodeSubmissions(data);
  }

  createLessonCodeSubmission(data: CreateLessonCodeSubmissionInput) {
    return this._lessonRepository.createLessonCodeSubmission(data);
  }

  getLessonGeneratedQuestions(data: GetLessonGeneratedQuestionsInput) {
    return this._lessonRepository.getLessonGeneratedQuestions(data);
  }

  createLessonGeneratedQuestions(data: CreateLessonGeneratedQuestionsInput) {
    return this._lessonRepository.createLessonGeneratedQuestions(data);
  }

  findLessonQuestionSolution(data: FindLessonQuestionSolutionInput) {
    return this._lessonRepository.findLessonQuestionSolution(data);
  }

  createLessonQuestionSolution(data: CreateLessonQuestionSolutionInput) {
    return this._lessonRepository.createLessonQuestionSolution(data);
  }

  getLessonQuestionSolutionDoubts(data: GetLessonQuestionSolutionDoubtsInput) {
    return this._lessonRepository.getLessonQuestionSolutionDoubts(data);
  }

  createLessonQuestionSolutionDoubt(data: CreateLessonQuestionSolutionDoubtInput) {
    return this._lessonRepository.createLessonQuestionSolutionDoubt(data);
  }

  clearLessonQuestionSolutionDoubts(data: ClearLessonQuestionSolutionDoubtsInput) {
    return this._lessonRepository.clearLessonQuestionSolutionDoubts(data);
  }

  findGeneratedLessonBySubtopic(data: FindGeneratedLessonBySubtopicInput) {
    return this._lessonRepository.findGeneratedLessonBySubtopic(data);
  }

  findLessonVisualization(data: FindLessonVisualizationInput) {
    return this._lessonRepository.findLessonVisualization(data);
  }

  saveLessonVisualization(data: SaveLessonVisualizationInput) {
    return this._lessonRepository.saveLessonVisualization(data);
  }
  async createTrackerWithNestedContent(input: {
    userId: string;
    title: string;
    slug: string;
    description?: string;
    domain?: string;
    goal?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    isAIGenerated?: boolean;
    aiJobId?: string;
    topics: Array<{
      order: number;
      title: string;
      description?: string;
      learningVideo?: unknown | null;
      subtopicLearningVideos?: Map<string, unknown>;
      children?: any[];
    }>;
  }): Promise<{ trackerId: string }> {
    // Implement transactional creation using mongoose session and models used elsewhere.
    const { Tracker } = await import('../../../../../infrastructure/database/models/tracker.model');
    const { TrackerTopic } = await import('../../../../../infrastructure/database/models/tracker-topic.model');
    const { TrackerSubtopic } = await import('../../../../../infrastructure/database/models/tracker-subtopic.model');

    const session = await (await import('mongoose')).startSession();

    let createdTrackerId: any = null;

    try {
      await session.withTransaction(async () => {
        const totalSubtopicCount = input.topics.reduce((total, topicItem) => {
          const countRecursive = (nodes: any[]): number => {
            return (nodes || []).reduce((t, n) => t + 1 + countRecursive(n.children || []), 0);
          };
          return total + countRecursive(topicItem.children || []);
        }, 0);

        const trackers = await Tracker.create(
          [
            {
              ownerId: input.userId,

              title: input.title,
              slug: input.slug,
              description: input.description || '',

              category: input.domain || 'general',
              field: input.domain || '',
              goal: input.goal || '',

              level: input.level,

              status: 'draft',

              isAIGenerated: Boolean(input.isAIGenerated),
              aiJobId: input.aiJobId,

              topicsCount: input.topics.length,
              subtopicsCount: totalSubtopicCount,

              cloneCount: 0,
              likeCount: 0,
              saveCount: 0,

              progressPercent: 0,
              ratingAverage: 0,
              ratingCount: 0,
            },
          ],
          { session }
        );

        const tracker = trackers[0];
        createdTrackerId = tracker._id;

        const saveNestedSubtopics = async ({
          trackerId,
          topicId,
          parentSubtopicId,
          nodes,
          depth,
          topicOrder,
          learningVideos,
        }: any) => {
          for (const node of nodes) {
            const createdSubtopics = await TrackerSubtopic.create(
              [
                {
                  trackerId,
                  topicId,
                  parentSubtopicId,
                  title: node.title,
                  description: node.description || '',
                  order: node.order,
                  depth,
                  isLocked: true,
                  estimatedMinutes: 0,
                  learningVideo: depth === 1 ? learningVideos.get(`${topicOrder}:${node.order}`) || null : null,
                },
              ],
              { session }
            );

            const createdSubtopic = createdSubtopics[0];

            if (node.children?.length) {
              await saveNestedSubtopics({
                trackerId,
                topicId,
                parentSubtopicId: createdSubtopic._id,
                nodes: node.children,
                depth: depth + 1,
                topicOrder,
                learningVideos,
              });
            }
          }
        };

        for (let topicIndex = 0; topicIndex < input.topics.length; topicIndex++) {
          const topicData = input.topics[topicIndex];

          const savedTopics = await TrackerTopic.create(
            [
              {
                trackerId: tracker._id,
                title: topicData.title,
                description: topicData.description || '',
                order: topicData.order,
                learningVideo: topicData.learningVideo || null,
                status: topicIndex === 0 ? 'active' : 'locked',
                estimatedHours: 0,
                progressPercent: 0,
              },
            ],
            { session }
          );

          const savedTopic = savedTopics[0];

          if (topicData.children?.length) {
            await saveNestedSubtopics({
              trackerId: tracker._id,
              topicId: savedTopic._id,
              parentSubtopicId: null,
              nodes: topicData.children,
              depth: 1,
              topicOrder: topicData.order,
              learningVideos: topicData.subtopicLearningVideos || new Map(),
            });
          }
        }
      });
    } finally {
      await session.endSession();
    }

    if (!createdTrackerId) {
      throw new Error('Tracker was not created');
    }

    return { trackerId: String(createdTrackerId) };
  }
}

export const mongoTrackerRepository = new MongoTrackerRepository();
