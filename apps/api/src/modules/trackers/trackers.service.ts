// apps/api/src/modules/trackers/trackers.service.ts

import { trackerRepository } from './tracker.repository'
import { ApiError } from '../../shared/utils/ApiError'

type MissingTopicSuggestion = {
  title: string
  description: string
  reason: string
  suggestedParentTitle: string
  isAdded?: boolean
  addedSubtopicId?: string
  addedAt?: Date | string
}

type EvaluationOutputData = {
  trackerId?: string
  sourceRoadmapJobId?: string
  evaluation?: {
    score?: number
    grade?: string
    summary?: string
    missingTopics?: MissingTopicSuggestion[]
  }
}

const normalizeTitle = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
}

const findBestMatchingParent = <T extends { title: string }>(
  items: T[],
  suggestedParentTitle: string
): T | null => {
  const target = normalizeTitle(suggestedParentTitle)

  const exactMatch = items.find((item) => {
    return normalizeTitle(item.title) === target
  })

  if (exactMatch) {
    return exactMatch
  }

  const softMatch = items.find((item) => {
    const normalizedItemTitle = normalizeTitle(item.title)

    return (
      normalizedItemTitle.includes(target) ||
      target.includes(normalizedItemTitle)
    )
  })

  return softMatch || null
}

export const trackerService = {
  addMissingEvaluationTopic: async ({
    trackerId,
    evaluationJobId,
    topicIndex,
    userId,
  }: {
    trackerId: string
    evaluationJobId: string
    topicIndex: string
    userId: string
  }) => {
    const parsedTopicIndex = Number(topicIndex)

    if (
      !Number.isInteger(parsedTopicIndex) ||
      parsedTopicIndex < 0
    ) {
      throw new ApiError(
        400,
        'Invalid missing topic index',
        'INVALID_TOPIC_INDEX'
      )
    }

    const tracker =
      await trackerRepository.findOwnedTrackerById(
        trackerId,
        userId
      )

    if (!tracker) {
      throw new ApiError(
        404,
        'Tracker not found',
        'TRACKER_NOT_FOUND'
      )
    }

    const evaluationJob =
      await trackerRepository.findEvaluationJobById(
        evaluationJobId,
        userId
      )

    if (!evaluationJob) {
      throw new ApiError(
        404,
        'Evaluation job not found',
        'EVALUATION_JOB_NOT_FOUND'
      )
    }

    if (evaluationJob.status !== 'completed') {
      throw new ApiError(
        400,
        'Evaluation job is not completed yet',
        'EVALUATION_JOB_PENDING'
      )
    }

    const outputData =
      evaluationJob.outputData as EvaluationOutputData | undefined

    if (outputData?.trackerId !== trackerId) {
      throw new ApiError(
        400,
        'Evaluation result does not belong to this tracker',
        'TRACKER_EVALUATION_MISMATCH'
      )
    }

    const missingTopics =
      outputData?.evaluation?.missingTopics

    if (!Array.isArray(missingTopics)) {
      throw new ApiError(
        404,
        'Missing topic suggestions not found',
        'MISSING_TOPICS_NOT_FOUND'
      )
    }

    const missingTopic =
      missingTopics[parsedTopicIndex]

    if (!missingTopic) {
      throw new ApiError(
        404,
        'Missing topic suggestion not found',
        'MISSING_TOPIC_NOT_FOUND'
      )
    }

    if (
      missingTopic.isAdded ||
      missingTopic.addedSubtopicId
    ) {
      throw new ApiError(
        409,
        'This missing topic has already been added',
        'MISSING_TOPIC_ALREADY_ADDED'
      )
    }

    const [
      trackerTopics,
      trackerSubtopics,
    ] = await Promise.all([
      trackerRepository.getTopicsForTracker(
        trackerId
      ),

      trackerRepository.getSubtopicsForTracker(
        trackerId
      ),
    ])

    const suggestedParentTitle =
      missingTopic.suggestedParentTitle

    const matchedSubtopicParent =
      findBestMatchingParent(
        trackerSubtopics,
        suggestedParentTitle
      )

    const matchedTopicParent =
      matchedSubtopicParent
        ? null
        : findBestMatchingParent(
            trackerTopics,
            suggestedParentTitle
          )

    if (
      !matchedSubtopicParent &&
      !matchedTopicParent
    ) {
      throw new ApiError(
        404,
        `Suggested parent "${suggestedParentTitle}" was not found in this tracker`,
        'SUGGESTED_PARENT_NOT_FOUND'
      )
    }

    const topicId =
      matchedSubtopicParent
        ? matchedSubtopicParent.topicId.toString()
        : matchedTopicParent!._id.toString()

    const parentSubtopicId =
      matchedSubtopicParent
        ? matchedSubtopicParent._id.toString()
        : null

    const depth =
      matchedSubtopicParent
        ? matchedSubtopicParent.depth + 1
        : 1

    const lastSibling =
      await trackerRepository.findLastSiblingSubtopic({
        topicId,
        parentSubtopicId,
      })

    const nextOrder =
      (lastSibling?.order || 0) + 1

    const addedSubtopic =
      await trackerRepository.createTrackerSubtopic({
        trackerId,
        topicId,
        parentSubtopicId,
        title: missingTopic.title,
        description: missingTopic.description,
        order: nextOrder,
        depth,
      })

    await Promise.all([
      trackerRepository.incrementTrackerSubtopicsCount(
        trackerId
      ),

      trackerRepository.markMissingEvaluationTopicAsAdded({
        evaluationJobId,
        topicIndex: parsedTopicIndex,
        addedSubtopicId:
          addedSubtopic._id.toString(),
      }),
    ])

    return {
      trackerId,

      evaluationJobId,

      missingTopicIndex: parsedTopicIndex,

      addedSubtopic: {
        _id: addedSubtopic._id.toString(),
        trackerId:
          addedSubtopic.trackerId.toString(),
        topicId:
          addedSubtopic.topicId.toString(),
        parentSubtopicId:
          addedSubtopic.parentSubtopicId
            ? addedSubtopic.parentSubtopicId.toString()
            : null,
        title: addedSubtopic.title,
        description: addedSubtopic.description,
        order: addedSubtopic.order,
        depth: addedSubtopic.depth,
      },

      placedUnder: matchedSubtopicParent
        ? {
            type: 'subtopic',
            _id:
              matchedSubtopicParent._id.toString(),
            title:
              matchedSubtopicParent.title,
          }
        : {
            type: 'topic',
            _id:
              matchedTopicParent!._id.toString(),
            title:
              matchedTopicParent!.title,
          },
    }
  },
}