import { AIGenerationJob } from '../../../../infrastructure/database/models/ai-generation-job.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerSubtopic } from '../../../../infrastructure/database/models/tracker-subtopic.model'
import { TrackerTopic } from '../../../../infrastructure/database/models/tracker-topic.model'
import type {
  FindEvaluationJobByIdInput,
  FindLastSiblingSubtopicInput,
  MarkMissingEvaluationTopicAsAddedInput,
  ShiftTopicOrdersFromInput,
} from '../../domain/repositories/tracker-content.repository.interface'
import type { GetSubtopicByIdInput } from '../../domain/repositories/tracker-query.repository.interface'
import type {
  CreateTrackerSubtopicInput,
  CreateTrackerTopicInput,
  CreatedTrackerSubtopicRecord,
  CreatedTrackerTopicRecord,
  EvaluationJobRecord,
  LastSiblingSubtopicRecord,
  LastTopicRecord,
  TrackerSubtopicRecord,
  TrackerTopicRecord,
} from '../../domain/types/trackers.types'
import { MongoTrackerBaseRepository } from './mongo-tracker-base.repository'
import { MongoTrackerErrorMapper } from './mongo-tracker-error.mapper'
import type { MongoUpdate } from './mongo-tracker.types'

export class MongoTrackerContentRepository extends MongoTrackerBaseRepository {
  async findEvaluationJobById(data: FindEvaluationJobByIdInput) {
    return this.execute(
      'EVALUATION_JOB_READ_FAILED',
      'Failed to read evaluation job',
      async () => {
        const job = await AIGenerationJob.findOne(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.evaluationJobId),
            userId: this.toObjectId(data.userId),
            jobType: 'evaluation',
            deletedAt: null,
          }),
        )

        return job as EvaluationJobRecord | null
      },
    )
  }

  async getTopicsForTracker(trackerId: string) {
    return this.execute(
      'TRACKER_TOPIC_READ_FAILED',
      'Failed to read tracker topics',
      async () => {
        const topics = await TrackerTopic.find(
          this.mapper.asMongoFilter({
            trackerId: this.toObjectId(trackerId),
            deletedAt: null,
          }),
        ).sort({
          order: 1,
        })

        return topics as TrackerTopicRecord[]
      },
    )
  }

  async getSubtopicsForTracker(trackerId: string) {
    return this.execute(
      'TRACKER_SUBTOPIC_READ_FAILED',
      'Failed to read tracker subtopics',
      async () => {
        const subtopics = await TrackerSubtopic.find(
          this.mapper.asMongoFilter({
            trackerId: this.toObjectId(trackerId),
            deletedAt: null,
          }),
        ).sort({
          depth: 1,
          order: 1,
        })

        return subtopics as TrackerSubtopicRecord[]
      },
    )
  }

  async getSubtopicById(data: GetSubtopicByIdInput) {
    return this.execute(
      'TRACKER_SUBTOPIC_READ_FAILED',
      'Failed to read tracker subtopic',
      async () => {
        const subtopic = await TrackerSubtopic.findOne(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.subtopicId),
            trackerId: this.toObjectId(data.trackerId),
            deletedAt: null,
          }),
        )

        return subtopic as TrackerSubtopicRecord | null
      },
    )
  }

  async findLastTopicForTracker(trackerId: string) {
    return this.execute(
      'TRACKER_TOPIC_READ_FAILED',
      'Failed to read last tracker topic',
      async () => {
        const topic = await TrackerTopic.findOne(
          this.mapper.asMongoFilter({
            trackerId: this.toObjectId(trackerId),
            deletedAt: null,
          }),
        ).sort({
          order: -1,
        })

        return topic as LastTopicRecord | null
      },
    )
  }

  async shiftTopicOrdersFrom(data: ShiftTopicOrdersFromInput) {
    return this.execute(
      'TRACKER_TOPIC_UPDATE_FAILED',
      'Failed to shift tracker topic orders',
      async () =>
        TrackerTopic.updateMany(
          this.mapper.asMongoFilter({
            trackerId: this.toObjectId(data.trackerId),
            order: {
              $gte: data.fromOrder,
            },
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $inc: {
              order: 1,
            },
          }),
        ),
    )
  }

  async createTrackerTopic(data: CreateTrackerTopicInput) {
    return this.execute(
      'TRACKER_TOPIC_CREATE_FAILED',
      'Failed to create tracker topic',
      async () => {
        const topic = await TrackerTopic.create(
          this.mapper.asMongoCreatePayload({
            trackerId: this.toObjectId(data.trackerId),
            title: data.title,
            description: data.description,
            order: data.order,
            estimatedHours: 0,
            deletedAt: null,
          }),
        )

        return topic as CreatedTrackerTopicRecord
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    )
  }

  async findLastSiblingSubtopic(data: FindLastSiblingSubtopicInput) {
    return this.execute(
      'TRACKER_SUBTOPIC_READ_FAILED',
      'Failed to read last sibling subtopic',
      async () => {
        const subtopic = await TrackerSubtopic.findOne(
          this.mapper.asMongoFilter({
            topicId: this.toObjectId(data.topicId),
            parentSubtopicId: data.parentSubtopicId
              ? this.toObjectId(data.parentSubtopicId)
              : null,
            deletedAt: null,
          }),
        ).sort({
          order: -1,
        })

        return subtopic as LastSiblingSubtopicRecord | null
      },
    )
  }

  async createTrackerSubtopic(data: CreateTrackerSubtopicInput) {
    return this.execute(
      'TRACKER_SUBTOPIC_CREATE_FAILED',
      'Failed to create tracker subtopic',
      async () => {
        const subtopic = await TrackerSubtopic.create(
          this.mapper.asMongoCreatePayload({
            trackerId: this.toObjectId(data.trackerId),
            topicId: this.toObjectId(data.topicId),
            parentSubtopicId: data.parentSubtopicId
              ? this.toObjectId(data.parentSubtopicId)
              : null,
            title: data.title,
            description: data.description,
            order: data.order,
            depth: data.depth,
            isLocked: data.depth !== 1,
            estimatedMinutes: data.estimatedMinutes || 0,
            deletedAt: null,
          }),
        )

        return subtopic as CreatedTrackerSubtopicRecord
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    )
  }

  async incrementTrackerTopicsCount(trackerId: string) {
    return this.execute(
      'TRACKER_TOPIC_COUNT_UPDATE_FAILED',
      'Failed to increment tracker topic count',
      async () =>
        Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(trackerId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $inc: {
              topicsCount: 1,
            },
          }),
          {
            returnDocument: 'after',
          },
        ),
    )
  }

  async incrementTrackerSubtopicsCount(trackerId: string) {
    return this.execute(
      'TRACKER_SUBTOPIC_COUNT_UPDATE_FAILED',
      'Failed to increment tracker subtopic count',
      async () =>
        Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(trackerId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $inc: {
              subtopicsCount: 1,
            },
          }),
          {
            returnDocument: 'after',
          },
        ),
    )
  }

  async markMissingEvaluationTopicAsAdded(
    data: MarkMissingEvaluationTopicAsAddedInput,
  ) {
    return this.execute(
      'EVALUATION_TOPIC_UPDATE_FAILED',
      'Failed to mark missing evaluation topic as added',
      async () => {
        const update: MongoUpdate = {
          [`outputData.evaluation.missingTopics.${data.topicIndex}.isAdded`]:
            true,
          [`outputData.evaluation.missingTopics.${data.topicIndex}.addedAt`]:
            new Date(),
        }

        if (data.addedSubtopicId) {
          update[
            `outputData.evaluation.missingTopics.${data.topicIndex}.addedSubtopicId`
          ] = data.addedSubtopicId
        }

        if (data.addedTopicId) {
          update[
            `outputData.evaluation.missingTopics.${data.topicIndex}.addedTopicId`
          ] = data.addedTopicId
        }

        return AIGenerationJob.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: this.toObjectId(data.evaluationJobId),
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: update,
          }),
          {
            returnDocument: 'after',
          },
        )
      },
    )
  }
}