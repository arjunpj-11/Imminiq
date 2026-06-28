import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerProgress } from '../../../../infrastructure/database/models/tracker-progress.model'
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
  TrackerRepositoryContract,
  UnpublishOwnedTrackerInput,
  UnlockNextSubtopicInput,
} from '../../domain/repositories/tracker.repository.interface'
import type {
  CreateTrackerInput,
  CreateTrackerSubtopicInput,
  CreateTrackerTopicInput,
  PublishTrackerInput,
  TrackerListFilter,
  TrackerRecord,
  UpdateSubtopicProgressInput,
  UpdateTrackerInput,
} from '../../domain/types/trackers.types'
import { MongoTrackerBaseRepository } from './mongo-tracker-base.repository'
import { MongoTrackerContentRepository } from './mongo-tracker-content.repository'
import { MongoTrackerErrorMapper } from './mongo-tracker-error.mapper'
import { MongoTrackerLessonRepository } from './mongo-tracker-lesson.repository'
import { MongoTrackerMapper } from './mongo-tracker.mapper'
import { MongoTrackerProgressRepository } from './mongo-tracker-progress.repository'
import type { MongoQuery, MongoUpdate } from './mongo-tracker.types'

export class MongoTrackerRepository
  extends MongoTrackerBaseRepository
  implements TrackerRepositoryContract
{
  private readonly _contentRepository: MongoTrackerContentRepository
  private readonly _progressRepository: MongoTrackerProgressRepository
  private readonly _lessonRepository: MongoTrackerLessonRepository

  constructor(mapper = new MongoTrackerMapper()) {
    super(mapper)

    this._contentRepository = new MongoTrackerContentRepository(mapper)
    this._progressRepository = new MongoTrackerProgressRepository(mapper)
    this._lessonRepository = new MongoTrackerLessonRepository(mapper)
  }

  async hasAnyTrackerForUser(userId: string) {
    return this.execute(
      'TRACKER_READ_FAILED',
      'Failed to check user trackers',
      async () => {
        const tracker = await Tracker.exists(
          this.mapper.asMongoFilter({
            ownerId: this.toObjectId(userId),
            deletedAt: null,
          }),
        )

        return Boolean(tracker)
      },
    )
  }

  async getTrackerSummary(userId: string) {
    return this.execute(
      'TRACKER_SUMMARY_READ_FAILED',
      'Failed to read tracker summary',
      async () => {
        const ownerId = this.toObjectId(userId)
        const base: MongoQuery = {
          ownerId,
          deletedAt: null,
        }

        const [total, active, completed, published, progressAgg] =
          await Promise.all([
            Tracker.countDocuments(this.mapper.asMongoFilter(base)),
            Tracker.countDocuments(
              this.mapper.asMongoFilter({
                ...base,
                status: 'active',
              }),
            ),
            Tracker.countDocuments(
              this.mapper.asMongoFilter({
                ...base,
                status: 'completed',
              }),
            ),
            Tracker.countDocuments(
              this.mapper.asMongoFilter({
                ...base,
                visibility: 'public',
                publishedAt: {
                  $ne: null,
                },
              }),
            ),
            Tracker.aggregate<{ avg?: number }>([
              {
                $match: base,
              },
              {
                $group: {
                  _id: null,
                  avg: {
                    $avg: '$progressPercent',
                  },
                },
              },
            ]),
          ])

        return {
          totalTrackers: total,
          activeTrackers: active,
          completedTrackers: completed,
          publishedTrackers: published,
          averageProgress: Math.round(progressAgg[0]?.avg || 0),
        }
      },
    )
  }

 async listOwnedTrackers(filter: TrackerListFilter) {
  return this.execute(
    'TRACKER_LIST_READ_FAILED',
    'Failed to read owned trackers',
    async () => {
      const {
        userId,
        status = 'all',
        domain = 'all',
        sortBy = 'lastActive',
        page,
        limit,
      } = filter

      const userObjId = this.toObjectId(userId)

      const query: MongoQuery = {
        ownerId: userObjId,
        deletedAt: null,
      }

      if (status !== 'all') {
        query.status = status
      }

      if (domain !== 'all') {
        query.domain = domain
      }

      const skip = (page - 1) * limit

      const [trackers, total] = await Promise.all([
        Tracker.find(this.mapper.asMongoFilter(query))
          .sort(this.mapper.buildTrackerSort(sortBy))
          .skip(skip)
          .limit(limit)
          .lean(),
        Tracker.countDocuments(this.mapper.asMongoFilter(query)),
      ])

      const trackerIds = trackers.map((tracker) => tracker._id)

      const progressList = await TrackerProgress.find(
        this.mapper.asMongoFilter({
          userId: userObjId,
          trackerId: {
            $in: trackerIds,
          },
          deletedAt: null,
        }),
      )
        .select(
          'trackerId completedTopics totalTopics completionPercentage lastStudiedAt',
        )
        .lean()

      const progressMap = new Map(
        progressList.map((progress) => [
          progress.trackerId.toString(),
          progress,
        ]),
      )

      const enrichedTrackers = trackers.map((tracker) => {
        const progress = progressMap.get(tracker._id.toString())

        return {
          ...tracker,

          completedTopics: progress?.completedTopics ?? 0,

          totalTopics:
            progress?.totalTopics ??
            tracker.topicsCount ??
            0,

          progressPercent:
            progress?.completionPercentage ??
            tracker.progressPercent ??
            0,

          lastActiveAt:
            progress?.lastStudiedAt ??
            tracker.lastActiveAt ??
            tracker.updatedAt ??
            tracker.createdAt,
        }
      })

      return {
        trackers: enrichedTrackers as TrackerRecord[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    },
  )
}

  async createTracker(data: CreateTrackerInput) {
    return this.execute(
      'TRACKER_CREATE_FAILED',
      'Failed to create tracker',
      async () => {
        const tracker = await Tracker.create(
          this.mapper.asMongoCreatePayload({
            ownerId: this.toObjectId(data.userId),
            title: data.title,
            description: data.description || '',
            domain: data.domain || 'other',
            goal: data.goal || '',
            level: data.level || 'beginner',
            status: 'active',
            visibility: data.visibility || 'private',
            progressPercent: 0,
            topicsCount: 0,
            subtopicsCount: 0,
            completedSubtopicsCount: 0,
            lastActiveAt: new Date(),
            publishedAt: null,
            completedAt: null,
            deletedAt: null,
          }),
        )

        return tracker as TrackerRecord
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    )
  }

  async updateOwnedTracker(data: UpdateTrackerInput) {
    return this.execute(
      'TRACKER_UPDATE_FAILED',
      'Failed to update owned tracker',
      async () => {
        const update: MongoUpdate = {}

        if (data.title !== undefined) {
          update.title = data.title
        }

        if (data.description !== undefined) {
          update.description = data.description
        }

        if (data.domain !== undefined) {
          update.domain = data.domain
        }

        if (data.goal !== undefined) {
          update.goal = data.goal
        }

        if (data.level !== undefined) {
          update.level = data.level
        }

        const tracker = await Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.trackerId),
            ownerId: this.toObjectId(data.userId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: update,
          }),
          {
            returnDocument: 'after',
          },
        )

        return tracker as TrackerRecord | null
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    )
  }

  async softDeleteOwnedTracker(data: SoftDeleteOwnedTrackerInput) {
    return this.execute(
      'TRACKER_DELETE_FAILED',
      'Failed to delete owned tracker',
      async () => {
        const tracker = await Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.trackerId),
            ownerId: this.toObjectId(data.userId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: {
              deletedAt: new Date(),
            },
          }),
          {
            returnDocument: 'after',
          },
        )

        return tracker as TrackerRecord | null
      },
    )
  }

  async findOwnedTrackerById(data: FindOwnedTrackerByIdInput) {
    return this.execute(
      'TRACKER_READ_FAILED',
      'Failed to read owned tracker',
      async () => {
        const tracker = await Tracker.findOne(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.trackerId),
            ownerId: this.toObjectId(data.userId),
            deletedAt: null,
          }),
        )

        return tracker as TrackerRecord | null
      },
    )
  }

  async archiveOwnedTracker(data: ArchiveOwnedTrackerInput) {
    return this.execute(
      'TRACKER_ARCHIVE_FAILED',
      'Failed to archive tracker',
      async () => {
        const tracker = await Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.trackerId),
            ownerId: this.toObjectId(data.userId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: {
              status: 'archived',
            },
          }),
          {
            returnDocument: 'after',
          },
        )

        return tracker as TrackerRecord | null
      },
    )
  }

  async restoreOwnedTracker(data: RestoreOwnedTrackerInput) {
    return this.execute(
      'TRACKER_RESTORE_FAILED',
      'Failed to restore tracker',
      async () => {
        const tracker = await Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.trackerId),
            ownerId: this.toObjectId(data.userId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: {
              status: 'active',
            },
          }),
          {
            returnDocument: 'after',
          },
        )

        return tracker as TrackerRecord | null
      },
    )
  }

 async publishOwnedTracker(data: PublishTrackerInput) {
  return this.execute(
    'TRACKER_PUBLISH_FAILED',
    'Failed to publish tracker',
    async () => {
      const update: MongoUpdate = {
        visibility: 'public',
        publishedAt: new Date(),
      }

      if (typeof data.name === 'string' && data.name.trim()) {
        update.title = data.name.trim()
      }

      if (typeof data.description === 'string') {
        update.description = data.description.trim()
      }

      // Input uses `domain`, but MongoDB tracker field is `category`
      if (typeof data.domain === 'string' && data.domain.trim()) {
        update.category = data.domain.trim()
      }

      if (
        data.difficulty === 'beginner' ||
        data.difficulty === 'intermediate' ||
        data.difficulty === 'advanced'
      ) {
        update.level = data.difficulty
      }

      if (Array.isArray(data.tags)) {
        update.tags = data.tags
          .map((tag) => String(tag).trim().toLowerCase())
          .filter(Boolean)
      }

      if (typeof data.allowClone === 'boolean') {
        update.allowClone = data.allowClone
      }

      const tracker = await Tracker.findOneAndUpdate(
        this.mapper.asMongoFilter({
          _id: this.toObjectId(data.trackerId),
          ownerId: this.toObjectId(data.userId),
          deletedAt: null,
        }),
        this.mapper.asMongoUpdate({
          $set: update,
        }),
        {
          returnDocument: 'after',
        },
      )

      return tracker as TrackerRecord | null
    },
    MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
  )
}

  async unpublishOwnedTracker(data: UnpublishOwnedTrackerInput) {
    return this.execute(
      'TRACKER_UNPUBLISH_FAILED',
      'Failed to unpublish tracker',
      async () => {
        const tracker = await Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.trackerId),
            ownerId: this.toObjectId(data.userId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: {
              visibility: 'private',
              publishedAt: null,
            },
          }),
          {
            returnDocument: 'after',
          },
        )

        return tracker as TrackerRecord | null
      },
    )
  }

  findEvaluationJobById(data: FindEvaluationJobByIdInput) {
    return this._contentRepository.findEvaluationJobById(data)
  }

  getTopicsForTracker(trackerId: string) {
    return this._contentRepository.getTopicsForTracker(trackerId)
  }

  getSubtopicsForTracker(trackerId: string) {
    return this._contentRepository.getSubtopicsForTracker(trackerId)
  }

  getSubtopicById(data: GetSubtopicByIdInput) {
    return this._contentRepository.getSubtopicById(data)
  }

  findLastTopicForTracker(trackerId: string) {
    return this._contentRepository.findLastTopicForTracker(trackerId)
  }

  shiftTopicOrdersFrom(data: ShiftTopicOrdersFromInput) {
    return this._contentRepository.shiftTopicOrdersFrom(data)
  }

  createTrackerTopic(data: CreateTrackerTopicInput) {
    return this._contentRepository.createTrackerTopic(data)
  }

  findLastSiblingSubtopic(data: FindLastSiblingSubtopicInput) {
    return this._contentRepository.findLastSiblingSubtopic(data)
  }

  createTrackerSubtopic(data: CreateTrackerSubtopicInput) {
    return this._contentRepository.createTrackerSubtopic(data)
  }

  incrementTrackerTopicsCount(trackerId: string) {
    return this._contentRepository.incrementTrackerTopicsCount(trackerId)
  }

  incrementTrackerSubtopicsCount(trackerId: string) {
    return this._contentRepository.incrementTrackerSubtopicsCount(trackerId)
  }

  markMissingEvaluationTopicAsAdded(
    data: MarkMissingEvaluationTopicAsAddedInput,
  ) {
    return this._contentRepository.markMissingEvaluationTopicAsAdded(data)
  }

  ensureUserProgressInitialized(data: EnsureUserProgressInitializedInput) {
    return this._progressRepository.ensureUserProgressInitialized(data)
  }

  getUserSubtopicsProgress(data: GetUserSubtopicsProgressInput) {
    return this._progressRepository.getUserSubtopicsProgress(data)
  }

  getUserTopicsProgress(data: GetUserTopicsProgressInput) {
    return this._progressRepository.getUserTopicsProgress(data)
  }

  getSubtopicsWithUserProgress(data: GetSubtopicsWithUserProgressInput) {
    return this._progressRepository.getSubtopicsWithUserProgress(data)
  }

  getTopicsWithUserProgress(data: GetTopicsWithUserProgressInput) {
    return this._progressRepository.getTopicsWithUserProgress(data)
  }

  updateSubtopicProgress(data: UpdateSubtopicProgressInput) {
    return this._progressRepository.updateSubtopicProgress(data)
  }

  unlockNextSubtopic(data: UnlockNextSubtopicInput) {
    return this._progressRepository.unlockNextSubtopic(data)
  }

  checkAndCompleteParentSubtopic(data: CheckAndCompleteParentSubtopicInput) {
    return this._progressRepository.checkAndCompleteParentSubtopic(data)
  }

  checkAndCompleteTopicAndUnlockNext(
    data: CheckAndCompleteTopicAndUnlockNextInput,
  ) {
    return this._progressRepository.checkAndCompleteTopicAndUnlockNext(data)
  }

  recomputeTrackerProgress(data: RecomputeTrackerProgressInput) {
    return this._progressRepository.recomputeTrackerProgress(data)
  }

  findLessonBySubtopicId(data: FindLessonBySubtopicIdInput) {
    return this._lessonRepository.findLessonBySubtopicId(data)
  }

  createLesson(data: CreateTrackerLessonInput) {
    return this._lessonRepository.createLesson(data)
  }

  getLessonChatMessages(data: GetLessonChatMessagesInput) {
    return this._lessonRepository.getLessonChatMessages(data)
  }

  createLessonChatMessage(data: CreateLessonChatMessageInput) {
    return this._lessonRepository.createLessonChatMessage(data)
  }

  clearLessonChatMessages(data: ClearLessonChatMessagesInput) {
    return this._lessonRepository.clearLessonChatMessages(data)
  }

  getLessonAnswerAttempts(data: GetLessonAnswerAttemptsInput) {
    return this._lessonRepository.getLessonAnswerAttempts(data)
  }

  createLessonAnswerAttempt(data: CreateLessonAnswerAttemptInput) {
    return this._lessonRepository.createLessonAnswerAttempt(data)
  }

  getLessonCodeSubmissions(data: GetLessonCodeSubmissionsInput) {
    return this._lessonRepository.getLessonCodeSubmissions(data)
  }

  createLessonCodeSubmission(data: CreateLessonCodeSubmissionInput) {
    return this._lessonRepository.createLessonCodeSubmission(data)
  }

  getLessonGeneratedQuestions(data: GetLessonGeneratedQuestionsInput) {
    return this._lessonRepository.getLessonGeneratedQuestions(data)
  }

  createLessonGeneratedQuestions(data: CreateLessonGeneratedQuestionsInput) {
    return this._lessonRepository.createLessonGeneratedQuestions(data)
  }

  findLessonQuestionSolution(data: FindLessonQuestionSolutionInput) {
    return this._lessonRepository.findLessonQuestionSolution(data)
  }

  createLessonQuestionSolution(data: CreateLessonQuestionSolutionInput) {
    return this._lessonRepository.createLessonQuestionSolution(data)
  }

  getLessonQuestionSolutionDoubts(data: GetLessonQuestionSolutionDoubtsInput) {
    return this._lessonRepository.getLessonQuestionSolutionDoubts(data)
  }

  createLessonQuestionSolutionDoubt(
    data: CreateLessonQuestionSolutionDoubtInput,
  ) {
    return this._lessonRepository.createLessonQuestionSolutionDoubt(data)
  }

  clearLessonQuestionSolutionDoubts(
    data: ClearLessonQuestionSolutionDoubtsInput,
  ) {
    return this._lessonRepository.clearLessonQuestionSolutionDoubts(data)
  }

  findGeneratedLessonBySubtopic(data: FindGeneratedLessonBySubtopicInput) {
    return this._lessonRepository.findGeneratedLessonBySubtopic(data)
  }

  findLessonVisualization(data: FindLessonVisualizationInput) {
    return this._lessonRepository.findLessonVisualization(data)
  }

  saveLessonVisualization(data: SaveLessonVisualizationInput) {
    return this._lessonRepository.saveLessonVisualization(data)
  }
}

export const mongoTrackerRepository = new MongoTrackerRepository()