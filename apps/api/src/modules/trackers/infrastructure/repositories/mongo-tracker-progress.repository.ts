import { Types } from 'mongoose'

import { StreakHistory } from '../../../../infrastructure/database/models/streak-history.model'
import { StreakSnapshot } from '../../../../infrastructure/database/models/streak-snapshot.model'
import { Tracker } from '../../../../infrastructure/database/models/tracker.model'
import { TrackerProgress } from '../../../../infrastructure/database/models/tracker-progress.model'
import { TrackerSubtopic } from '../../../../infrastructure/database/models/tracker-subtopic.model'
import { TrackerTopic } from '../../../../infrastructure/database/models/tracker-topic.model'
import { UserSubtopicProgress } from '../../../../infrastructure/database/models/user-subtopic-progress.model'
import { UserTopicProgress } from '../../../../infrastructure/database/models/user-topic-progress.model'
import type {
  CheckAndCompleteParentSubtopicInput,
  CheckAndCompleteTopicAndUnlockNextInput,
  EnsureUserProgressInitializedInput,
  GetUserSubtopicsProgressInput,
  GetUserTopicsProgressInput,
  RecomputeTrackerProgressInput,
  UnlockNextSubtopicInput,
} from '../../domain/repositories/tracker-progress.repository.interface'
import type {
  GetSubtopicsWithUserProgressInput,
  GetTopicsWithUserProgressInput,
} from '../../domain/repositories/tracker-query.repository.interface'
import type {
  TopicWithProgressRecord,
  TrackerProgressRecord,
  UpdateSubtopicProgressInput,
  UserSubtopicProgressRecord,
  UserTopicProgressRecord,
} from '../../domain/types/trackers.types'
import { MongoTrackerBaseRepository } from './mongo-tracker-base.repository'
import { MongoTrackerErrorMapper } from './mongo-tracker-error.mapper'
import type {
  MongoSubtopicContentRecord,
  MongoSubtopicProgressRecord,
  MongoTopicContentRecord,
  MongoTopicProgressRecord,
} from './mongo-tracker.types'

export class MongoTrackerProgressRepository extends MongoTrackerBaseRepository {
  async ensureUserProgressInitialized(
    data: EnsureUserProgressInitializedInput,
  ) {
    return this.execute(
      'TRACKER_PROGRESS_INIT_FAILED',
      'Failed to initialize tracker progress',
      async () => {
        const userObjId = this.toObjectId(data.userId)
        const trackerObjId = this.toObjectId(data.trackerId)

        const existing = await UserSubtopicProgress.findOne(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            deletedAt: null,
          }),
        )

        if (existing) {
          return
        }

        const [topics, subtopics] = await Promise.all([
          TrackerTopic.find(
            this.mapper.asMongoFilter({
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          )
            .sort({
              order: 1,
            })
            .lean(),
          TrackerSubtopic.find(
            this.mapper.asMongoFilter({
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          )
            .sort({
              depth: 1,
              order: 1,
            })
            .lean(),
        ])

        if (topics.length > 0) {
          await UserTopicProgress.insertMany(
            topics.map((topic) => ({
              userId: userObjId,
              trackerId: trackerObjId,
              topicId: topic._id,
              status: 'active',
              progressPercent: 0,
              completedAt: null,
              deletedAt: null,
            })),
          )
        }

        if (subtopics.length > 0) {
          await UserSubtopicProgress.insertMany(
            subtopics.map((subtopic) => ({
              userId: userObjId,
              trackerId: trackerObjId,
              topicId: subtopic.topicId,
              subtopicId: subtopic._id,
              status: subtopic.isLocked ? 'locked' : 'available',
              isUnlocked: !subtopic.isLocked,
              progressPercent: 0,
              completedAt: null,
              deletedAt: null,
            })),
          )
        }

        await TrackerProgress.findOneAndUpdate(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $setOnInsert: {
              userId: userObjId,
              trackerId: trackerObjId,
              totalTopics: topics.length,
              completedTopics: 0,
              totalSubtopics: subtopics.length,
              completedSubtopics: 0,
              completionPercentage: 0,
              lastStudiedAt: null,
              startedAt: new Date(),
              completedAt: null,
              deletedAt: null,
            },
          }),
          {
            upsert: true,
          },
        )
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    )
  }

  async getUserSubtopicsProgress(data: GetUserSubtopicsProgressInput) {
    return this.execute(
      'TRACKER_SUBTOPIC_PROGRESS_READ_FAILED',
      'Failed to read user subtopic progress',
      async () => {
        const docs = await UserSubtopicProgress.find(
          this.mapper.asMongoFilter({
            userId: this.toObjectId(data.userId),
            trackerId: this.toObjectId(data.trackerId),
            deletedAt: null,
          }),
        ).lean()

        return docs as UserSubtopicProgressRecord[]
      },
    )
  }

  async getUserTopicsProgress(data: GetUserTopicsProgressInput) {
    return this.execute(
      'TRACKER_TOPIC_PROGRESS_READ_FAILED',
      'Failed to read user topic progress',
      async () => {
        const docs = await UserTopicProgress.find(
          this.mapper.asMongoFilter({
            userId: this.toObjectId(data.userId),
            trackerId: this.toObjectId(data.trackerId),
            deletedAt: null,
          }),
        ).lean()

        return docs as UserTopicProgressRecord[]
      },
    )
  }

  async getSubtopicsWithUserProgress(
    data: GetSubtopicsWithUserProgressInput,
  ) {
    return this.execute(
      'TRACKER_SUBTOPIC_PROGRESS_READ_FAILED',
      'Failed to read subtopics with user progress',
      async () => {
        const trackerObjId = this.toObjectId(data.trackerId)
        const userObjId = this.toObjectId(data.userId)

        const [subtopics, userProgress] = await Promise.all([
          TrackerSubtopic.find(
            this.mapper.asMongoFilter({
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          )
            .sort({
              depth: 1,
              order: 1,
            })
            .lean<MongoSubtopicContentRecord[]>(),
          UserSubtopicProgress.find(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          ).lean<MongoSubtopicProgressRecord[]>(),
        ])

        const progressMap = new Map(
          userProgress.map((progress) => [
            progress.subtopicId?.toString?.() ?? '',
            progress,
          ]),
        )

        return subtopics.map((subtopic) =>
          this.mapper.toSubtopicWithProgress(
            subtopic,
            progressMap.get(subtopic._id.toString()),
          ),
        )
      },
    )
  }

  async getTopicsWithUserProgress(data: GetTopicsWithUserProgressInput) {
    return this.execute(
      'TRACKER_TOPIC_PROGRESS_READ_FAILED',
      'Failed to read topics with user progress',
      async () => {
        const trackerObjId = this.toObjectId(data.trackerId)
        const userObjId = this.toObjectId(data.userId)

        const [topics, userProgress] = await Promise.all([
          TrackerTopic.find(
            this.mapper.asMongoFilter({
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          )
            .sort({
              order: 1,
            })
            .lean<MongoTopicContentRecord[]>(),
          UserTopicProgress.find(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          ).lean<MongoTopicProgressRecord[]>(),
        ])

        const progressMap = new Map(
          userProgress.map((progress) => [
            progress.topicId?.toString?.() ?? '',
            progress,
          ]),
        )

        return topics.map((topic) =>
          this.mapper.toTopicWithProgress(
            topic,
            progressMap.get(topic._id.toString()),
          ),
        ) as TopicWithProgressRecord[]
      },
    )
  }

  async updateSubtopicProgress(data: UpdateSubtopicProgressInput) {
    return this.execute(
      'TRACKER_SUBTOPIC_PROGRESS_UPDATE_FAILED',
      'Failed to update subtopic progress',
      async () => {
        const userObjId = this.toObjectId(data.userId)
        const subtopicObjId = this.toObjectId(data.subtopicId)
        const trackerObjId = this.toObjectId(data.trackerId)

        const subtopic = await TrackerSubtopic.findOne(
          this.mapper.asMongoFilter({
            _id: subtopicObjId,
            trackerId: trackerObjId,
            deletedAt: null,
          }),
        ).lean<MongoSubtopicContentRecord>()

        if (!subtopic) {
          return null
        }

        const now = new Date()

        const previousProgress = await UserSubtopicProgress.findOne(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            subtopicId: subtopicObjId,
            deletedAt: null,
          }),
        ).lean<MongoSubtopicProgressRecord>()

        const progressUpdate: Record<string, unknown> = {
          status: data.status,
          isUnlocked: true,
        }

        if (data.status === 'completed') {
          progressUpdate.progressPercent = 100
          progressUpdate.completedAt = previousProgress?.completedAt ?? now
        } else if (data.status === 'in_progress') {
          progressUpdate.progressPercent = 50
          progressUpdate.completedAt = null
        } else if (data.status === 'available') {
          progressUpdate.progressPercent = 0
          progressUpdate.completedAt = null
        }

        const userProgress = await UserSubtopicProgress.findOneAndUpdate(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            subtopicId: subtopicObjId,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $setOnInsert: {
              userId: userObjId,
              trackerId: trackerObjId,
              topicId: subtopic.topicId,
              subtopicId: subtopicObjId,
              deletedAt: null,
            },
            $set: progressUpdate,
          }),
          {
            returnDocument: 'after',
            upsert: true,
          },
        ).lean<MongoSubtopicProgressRecord>()

        const [
          totalSubtopics,
          completedSubtopics,
          totalTopics,
          completedTopics,
        ] = await Promise.all([
          TrackerSubtopic.countDocuments(
            this.mapper.asMongoFilter({
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          ),
          UserSubtopicProgress.countDocuments(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              status: 'completed',
              deletedAt: null,
            }),
          ),
          UserTopicProgress.countDocuments(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          ),
          UserTopicProgress.countDocuments(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              status: 'completed',
              deletedAt: null,
            }),
          ),
        ])

        const completionPercentage =
          totalSubtopics > 0
            ? Math.min(
                100,
                Math.round((completedSubtopics / totalSubtopics) * 100),
              )
            : 0

        await Promise.all([
          Tracker.findOneAndUpdate(
            this.mapper.asMongoFilter({
              _id: trackerObjId,
              deletedAt: null,
            }),
            this.mapper.asMongoUpdate({
              $set: {
                lastActiveAt: now,
              },
            }),
          ),
          TrackerProgress.findOneAndUpdate(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              deletedAt: null,
            }),
            this.mapper.asMongoUpdate({
              $setOnInsert: {
                userId: userObjId,
                trackerId: trackerObjId,
                deletedAt: null,
              },
              $set: {
                lastStudiedAt: now,
                completedSubtopics,
                totalSubtopics,
                completedTopics,
                totalTopics,
                completionPercentage,
                status:
                  completionPercentage >= 100
                    ? 'completed'
                    : completionPercentage > 0
                      ? 'in_progress'
                      : 'not_started',
              },
            }),
            {
              upsert: true,
              returnDocument: 'after',
            },
          ),
          this.updateUserStreakAfterTrackerActivity({
            userObjId,
            trackerObjId,
            subtopicObjId,
          }),
        ])

        return this.mapper.toSubtopicWithProgress(subtopic, userProgress)
      },
      MongoTrackerErrorMapper.mapDuplicateTrackerRecordError,
    )
  }

  async unlockNextSubtopic(data: UnlockNextSubtopicInput) {
    return this.execute(
      'TRACKER_SUBTOPIC_UNLOCK_FAILED',
      'Failed to unlock next subtopic',
      async () => {
        const trackerObjId = this.toObjectId(data.trackerId)
        const userObjId = this.toObjectId(data.userId)
        const topicObjId = this.toObjectId(data.topicId)

        const nextSubtopic = await TrackerSubtopic.findOne(
          this.mapper.asMongoFilter({
            trackerId: trackerObjId,
            topicId: topicObjId,
            order: {
              $gt: data.completedSubtopicOrder,
            },
            deletedAt: null,
          }),
        )
          .sort({
            order: 1,
          })
          .lean()

        if (!nextSubtopic) {
          return null
        }

        return UserSubtopicProgress.findOneAndUpdate(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            subtopicId: nextSubtopic._id,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $setOnInsert: {
              userId: userObjId,
              trackerId: trackerObjId,
              topicId: topicObjId,
              subtopicId: nextSubtopic._id,
              deletedAt: null,
            },
            $set: {
              isUnlocked: true,
              status: 'available',
            },
          }),
          {
            returnDocument: 'after',
            upsert: true,
          },
        )
      },
    )
  }

  async checkAndCompleteParentSubtopic(
    data: CheckAndCompleteParentSubtopicInput,
  ) {
    return this.execute(
      'TRACKER_PARENT_SUBTOPIC_UPDATE_FAILED',
      'Failed to check and complete parent subtopic',
      async () => {
        const userObjId = this.toObjectId(data.userId)
        const trackerObjId = this.toObjectId(data.trackerId)
        const topicObjId = this.toObjectId(data.topicId)
        const parentObjId = this.toObjectId(data.parentSubtopicId)

        const allChildren = await TrackerSubtopic.find(
          this.mapper.asMongoFilter({
            trackerId: trackerObjId,
            topicId: topicObjId,
            parentSubtopicId: parentObjId,
            deletedAt: null,
          }),
        ).lean()

        if (allChildren.length === 0) {
          return null
        }

        const childIds = allChildren.map((child) => child._id)

        const completedCount = await UserSubtopicProgress.countDocuments(
          this.mapper.asMongoFilter({
            userId: userObjId,
            subtopicId: {
              $in: childIds,
            },
            status: 'completed',
            deletedAt: null,
          }),
        )

        const progressPercent = Math.round(
          (completedCount / allChildren.length) * 100,
        )

        if (completedCount < allChildren.length) {
          await UserSubtopicProgress.findOneAndUpdate(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              subtopicId: parentObjId,
              deletedAt: null,
            }),
            this.mapper.asMongoUpdate({
              $setOnInsert: {
                userId: userObjId,
                trackerId: trackerObjId,
                topicId: topicObjId,
                subtopicId: parentObjId,
                deletedAt: null,
              },
              $set: {
                progressPercent,
                status: 'in_progress',
                isUnlocked: true,
              },
            }),
            {
              upsert: true,
            },
          )

          return null
        }

        const updatedParent = await UserSubtopicProgress.findOneAndUpdate(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            subtopicId: parentObjId,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $setOnInsert: {
              userId: userObjId,
              trackerId: trackerObjId,
              topicId: topicObjId,
              subtopicId: parentObjId,
              deletedAt: null,
            },
            $set: {
              status: 'completed',
              progressPercent: 100,
              completedAt: new Date(),
              isUnlocked: true,
            },
          }),
          {
            returnDocument: 'after',
            upsert: true,
          },
        )

        const parentContent = await TrackerSubtopic.findOne(
          this.mapper.asMongoFilter({
            _id: parentObjId,
            deletedAt: null,
          }),
        ).lean()

        if (!parentContent) {
          return updatedParent
        }

        const nextSibling = await TrackerSubtopic.findOne(
          this.mapper.asMongoFilter({
            trackerId: trackerObjId,
            topicId: topicObjId,
            parentSubtopicId: parentContent.parentSubtopicId ?? null,
            order: {
              $gt: parentContent.order,
            },
            deletedAt: null,
          }),
        )
          .sort({
            order: 1,
          })
          .lean()

        if (nextSibling) {
          await UserSubtopicProgress.findOneAndUpdate(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              subtopicId: nextSibling._id,
              deletedAt: null,
            }),
            this.mapper.asMongoUpdate({
              $setOnInsert: {
                userId: userObjId,
                trackerId: trackerObjId,
                topicId: topicObjId,
                subtopicId: nextSibling._id,
                deletedAt: null,
              },
              $set: {
                isUnlocked: true,
                status: 'available',
              },
            }),
            {
              upsert: true,
            },
          )
        }

        return updatedParent
      },
    )
  }

  async checkAndCompleteTopicAndUnlockNext(
    data: CheckAndCompleteTopicAndUnlockNextInput,
  ) {
    return this.execute(
      'TRACKER_TOPIC_PROGRESS_UPDATE_FAILED',
      'Failed to check and complete topic',
      async () => {
        const userObjId = this.toObjectId(data.userId)
        const trackerObjId = this.toObjectId(data.trackerId)
        const topicObjId = this.toObjectId(data.topicId)

        const allSubtopics = await TrackerSubtopic.find(
          this.mapper.asMongoFilter({
            trackerId: trackerObjId,
            topicId: topicObjId,
            deletedAt: null,
          }),
        ).lean()

        if (allSubtopics.length === 0) {
          return null
        }

        const subtopicIds = allSubtopics.map((subtopic) => subtopic._id)
        const total = allSubtopics.length

        const completedCount = await UserSubtopicProgress.countDocuments(
          this.mapper.asMongoFilter({
            userId: userObjId,
            subtopicId: {
              $in: subtopicIds,
            },
            status: 'completed',
            deletedAt: null,
          }),
        )

        const progressPercent = Math.round((completedCount / total) * 100)

        if (completedCount < total) {
          await UserTopicProgress.findOneAndUpdate(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              topicId: topicObjId,
              deletedAt: null,
            }),
            this.mapper.asMongoUpdate({
              $setOnInsert: {
                userId: userObjId,
                trackerId: trackerObjId,
                topicId: topicObjId,
                deletedAt: null,
              },
              $set: {
                progressPercent,
                status: 'active',
              },
            }),
            {
              upsert: true,
            },
          )

          return null
        }

        const completedTopic = await UserTopicProgress.findOneAndUpdate(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            topicId: topicObjId,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $setOnInsert: {
              userId: userObjId,
              trackerId: trackerObjId,
              topicId: topicObjId,
              deletedAt: null,
            },
            $set: {
              status: 'completed',
              progressPercent: 100,
              completedAt: new Date(),
            },
          }),
          {
            returnDocument: 'after',
            upsert: true,
          },
        )

        const currentTopic = await TrackerTopic.findOne(
          this.mapper.asMongoFilter({
            _id: topicObjId,
            deletedAt: null,
          }),
        ).lean()

        if (!currentTopic) {
          return completedTopic
        }

        const nextTopic = await TrackerTopic.findOne(
          this.mapper.asMongoFilter({
            trackerId: trackerObjId,
            order: {
              $gt: currentTopic.order,
            },
            deletedAt: null,
          }),
        )
          .sort({
            order: 1,
          })
          .lean()

        if (!nextTopic) {
          return completedTopic
        }

        await UserTopicProgress.findOneAndUpdate(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            topicId: nextTopic._id,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $setOnInsert: {
              userId: userObjId,
              trackerId: trackerObjId,
              topicId: nextTopic._id,
              deletedAt: null,
            },
            $set: {
              status: 'active',
            },
          }),
          {
            upsert: true,
          },
        )

        const firstSubtopic = await TrackerSubtopic.findOne(
          this.mapper.asMongoFilter({
            trackerId: trackerObjId,
            topicId: nextTopic._id,
            depth: 1,
            deletedAt: null,
          }),
        )
          .sort({
            order: 1,
          })
          .lean()

        if (firstSubtopic) {
          await UserSubtopicProgress.findOneAndUpdate(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              subtopicId: firstSubtopic._id,
              deletedAt: null,
            }),
            this.mapper.asMongoUpdate({
              $setOnInsert: {
                userId: userObjId,
                trackerId: trackerObjId,
                topicId: nextTopic._id,
                subtopicId: firstSubtopic._id,
                deletedAt: null,
              },
              $set: {
                isUnlocked: true,
                status: 'available',
              },
            }),
            {
              upsert: true,
            },
          )
        }

        return completedTopic
      },
    )
  }

  async recomputeTrackerProgress(data: RecomputeTrackerProgressInput) {
    return this.execute(
      'TRACKER_PROGRESS_RECOMPUTE_FAILED',
      'Failed to recompute tracker progress',
      async () => {
        const userObjId = this.toObjectId(data.userId)
        const trackerObjId = this.toObjectId(data.trackerId)

        const [
          totalSubtopics,
          completedSubtopics,
          totalTopics,
          completedTopics,
        ] = await Promise.all([
          UserSubtopicProgress.countDocuments(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          ),
          UserSubtopicProgress.countDocuments(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              status: 'completed',
              deletedAt: null,
            }),
          ),
          UserTopicProgress.countDocuments(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              deletedAt: null,
            }),
          ),
          UserTopicProgress.countDocuments(
            this.mapper.asMongoFilter({
              userId: userObjId,
              trackerId: trackerObjId,
              status: 'completed',
              deletedAt: null,
            }),
          ),
        ])

        const completionPercentage =
          totalSubtopics === 0
            ? 0
            : Math.round((completedSubtopics / totalSubtopics) * 100)

        await Tracker.findOneAndUpdate(
          this.mapper.asMongoFilter({
            _id: trackerObjId,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $set: {
              progressPercent: completionPercentage,
              completedSubtopicsCount: completedSubtopics,
              lastActiveAt: new Date(),
              ...(completionPercentage === 100
                ? {
                    status: 'completed',
                    completedAt: new Date(),
                  }
                : {}),
            },
          }),
        )

        const progress = await TrackerProgress.findOneAndUpdate(
          this.mapper.asMongoFilter({
            userId: userObjId,
            trackerId: trackerObjId,
            deletedAt: null,
          }),
          this.mapper.asMongoUpdate({
            $setOnInsert: {
              userId: userObjId,
              trackerId: trackerObjId,
              deletedAt: null,
            },
            $set: {
              totalSubtopics,
              completedSubtopics,
              totalTopics,
              completedTopics,
              completionPercentage,
              lastStudiedAt: new Date(),
              ...(completionPercentage === 100
                ? {
                    completedAt: new Date(),
                  }
                : {}),
            },
          }),
          {
            returnDocument: 'after',
            upsert: true,
          },
        )

        return progress as TrackerProgressRecord | null
      },
    )
  }

  private async updateUserStreakAfterTrackerActivity({
    userObjId,
    trackerObjId,
    subtopicObjId,
  }: {
    userObjId: Types.ObjectId
    trackerObjId: Types.ObjectId
    subtopicObjId: Types.ObjectId
  }): Promise<void> {
    const todayStart = this.mapper.getUtcDayStart()
    const yesterdayStart = this.mapper.getPreviousUtcDayStart(todayStart)
    const heatmapKey = todayStart.toISOString().slice(0, 10)
    const source = `tracker:${trackerObjId.toString()}:subtopic:${subtopicObjId.toString()}`

    const existingToday = await StreakHistory.findOne(
      this.mapper.asMongoFilter({
        userId: userObjId,
        date: todayStart,
        deletedAt: null,
      }),
    ).lean()

    const yesterdayHistory = await StreakHistory.findOne(
      this.mapper.asMongoFilter({
        userId: userObjId,
        date: yesterdayStart,
        deletedAt: null,
      }),
    ).lean()

    const yesterdayContinuesStreak =
      Boolean(yesterdayHistory) &&
      ((yesterdayHistory?.activityCount ?? 0) > 0 ||
        Boolean(yesterdayHistory?.isFrozen))

    const streakDay =
      existingToday?.streakDay && existingToday.streakDay > 0
        ? existingToday.streakDay
        : yesterdayContinuesStreak
          ? (yesterdayHistory?.streakDay ?? 0) + 1
          : 1

    const todayHistory = await StreakHistory.findOneAndUpdate(
      this.mapper.asMongoFilter({
        userId: userObjId,
        date: todayStart,
        deletedAt: null,
      }),
      this.mapper.asMongoUpdate({
        $setOnInsert: {
          userId: userObjId,
          date: todayStart,
          streakDay,
          isFrozen: false,
          freezeUsedId: null,
          deletedAt: null,
        },
        $inc: {
          activityCount: 1,
        },
        $addToSet: {
          sources: source,
        },
      }),
      {
        upsert: true,
        returnDocument: 'after',
      },
    ).lean()

    const activityCount = todayHistory?.activityCount ?? 1
    const intensityLevel = this.mapper.getIntensityLevel(activityCount)

    await StreakHistory.findOneAndUpdate(
      this.mapper.asMongoFilter({
        userId: userObjId,
        date: todayStart,
        deletedAt: null,
      }),
      this.mapper.asMongoUpdate({
        $set: {
          intensityLevel,
          streakDay,
        },
      }),
    )

    const [totalActiveDays, totalFreezeUsed, latestSnapshot] =
      await Promise.all([
        StreakHistory.countDocuments(
          this.mapper.asMongoFilter({
            userId: userObjId,
            deletedAt: null,
            activityCount: {
              $gt: 0,
            },
          }),
        ),
        StreakHistory.countDocuments(
          this.mapper.asMongoFilter({
            userId: userObjId,
            deletedAt: null,
            isFrozen: true,
          }),
        ),
        StreakSnapshot.findOne(
          this.mapper.asMongoFilter({
            userId: userObjId,
            deletedAt: null,
          }),
        )
          .sort({
            snapshotDate: -1,
          })
          .lean(),
      ])

    const currentStreak = streakDay
    const longestStreak = Math.max(
      latestSnapshot?.longestStreak ?? 0,
      currentStreak,
    )

    const previousHeatmapData =
      latestSnapshot?.heatmapData &&
      typeof latestSnapshot.heatmapData === 'object'
        ? latestSnapshot.heatmapData
        : {}

    await StreakSnapshot.findOneAndUpdate(
      this.mapper.asMongoFilter({
        userId: userObjId,
        snapshotDate: todayStart,
        deletedAt: null,
      }),
      this.mapper.asMongoUpdate({
        $setOnInsert: {
          userId: userObjId,
          snapshotDate: todayStart,
          deletedAt: null,
        },
        $set: {
          currentStreak,
          longestStreak,
          totalActiveDays,
          totalFreezeUsed,
          heatmapData: {
            ...previousHeatmapData,
            [heatmapKey]: {
              activityCount,
              intensityLevel,
              streakDay,
              isFrozen: false,
              sources: todayHistory?.sources ?? [source],
            },
          },
        },
      }),
      {
        upsert: true,
        returnDocument: 'after',
      },
    )
  }
}