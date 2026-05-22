import { ApiError } from '../../../../shared/utils/ApiError'

import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type {
  AddMissingEvaluationTopicInput,
  AddMissingEvaluationTopicResult,
  EvaluationOutputData,
  TrackerTopicRecord,
} from '../../domain/types/trackers.types'
import { findBestMatchingParent } from '../utils/tracker-parent-matching.util'

type NewTopLevelPlacement = {
  isNewTopLevel: boolean
  relation?: 'before' | 'after'
  referenceTitle?: string
}

const normalizePlacementReference = (value: string) => {
  return value
    .trim()
    .replace(/^["'“”‘’]+/, '')
    .replace(/["'“”‘’.)\]]+$/, '')
    .trim()
}

const parseNewTopLevelPlacement = (
  suggestedParentTitle: string
): NewTopLevelPlacement => {
  const placement = suggestedParentTitle.trim()

  if (!/^new\s+top\s+level\s+topic/i.test(placement)) {
    return { isNewTopLevel: false }
  }

  const followMatch = placement.match(/should\s+follow\s+(.+?)(?:\)|$)/i)

  if (followMatch?.[1]) {
    return {
      isNewTopLevel: true,
      relation: 'after',
      referenceTitle: normalizePlacementReference(followMatch[1]),
    }
  }

  const precedeMatch = placement.match(
    /should\s+(?:precede|come\s+before)\s+(.+?)(?:\)|$)/i
  )

  if (precedeMatch?.[1]) {
    return {
      isNewTopLevel: true,
      relation: 'before',
      referenceTitle: normalizePlacementReference(precedeMatch[1]),
    }
  }

  return { isNewTopLevel: true }
}

const resolveTopLevelTopicOrder = async (
  trackerRepository: TrackerRepository,
  trackerId: string,
  trackerTopics: TrackerTopicRecord[],
  placement: NewTopLevelPlacement
): Promise<number> => {
  if (placement.referenceTitle && placement.relation) {
    const referenceTopic = findBestMatchingParent(
      trackerTopics,
      placement.referenceTitle
    )

    if (referenceTopic) {
      const referenceOrder = referenceTopic.order

      const newOrder =
        placement.relation === 'before' ? referenceOrder : referenceOrder + 1

      await trackerRepository.shiftTopicOrdersFrom({
        trackerId,
        fromOrder: newOrder,
      })

      return newOrder
    }
  }

  const lastTopic = await trackerRepository.findLastTopicForTracker(trackerId)

  return (lastTopic?.order || 0) + 1
}

export class AddMissingEvaluationTopicUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute({
    trackerId,
    evaluationJobId,
    topicIndex,
    userId,
  }: AddMissingEvaluationTopicInput): Promise<AddMissingEvaluationTopicResult> {
    const parsedTopicIndex = Number(topicIndex)

    if (!Number.isInteger(parsedTopicIndex) || parsedTopicIndex < 0) {
      throw new ApiError(
        400,
        'Invalid missing topic index',
        'INVALID_TOPIC_INDEX'
      )
    }

    const tracker = await this.trackerRepository.findOwnedTrackerById(
      trackerId,
      userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    const evaluationJob = await this.trackerRepository.findEvaluationJobById(
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

    const outputData = evaluationJob.outputData as EvaluationOutputData | undefined

    if (outputData?.trackerId !== trackerId) {
      throw new ApiError(
        400,
        'Evaluation result does not belong to this tracker',
        'TRACKER_EVALUATION_MISMATCH'
      )
    }

    const missingTopics = outputData?.evaluation?.missingTopics

    if (!Array.isArray(missingTopics)) {
      throw new ApiError(
        404,
        'Missing topic suggestions not found',
        'MISSING_TOPICS_NOT_FOUND'
      )
    }

    const missingTopic = missingTopics[parsedTopicIndex]

    if (!missingTopic) {
      throw new ApiError(
        404,
        'Missing topic suggestion not found',
        'MISSING_TOPIC_NOT_FOUND'
      )
    }

    if (
      missingTopic.isAdded ||
      missingTopic.addedSubtopicId ||
      missingTopic.addedTopicId
    ) {
      throw new ApiError(
        409,
        'This missing topic has already been added',
        'MISSING_TOPIC_ALREADY_ADDED'
      )
    }

    const [trackerTopics, trackerSubtopics] = await Promise.all([
      this.trackerRepository.getTopicsForTracker(trackerId),
      this.trackerRepository.getSubtopicsForTracker(trackerId),
    ])

    const suggestedParentTitle = missingTopic.suggestedParentTitle
    const newTopLevelPlacement = parseNewTopLevelPlacement(suggestedParentTitle)

    if (newTopLevelPlacement.isNewTopLevel) {
      const newTopicOrder = await resolveTopLevelTopicOrder(
        this.trackerRepository,
        trackerId,
        trackerTopics,
        newTopLevelPlacement
      )

      const addedTopic = await this.trackerRepository.createTrackerTopic({
        trackerId,
        title: missingTopic.title,
        description: missingTopic.description,
        order: newTopicOrder,
      })

      await Promise.all([
        this.trackerRepository.incrementTrackerTopicsCount(trackerId),
        this.trackerRepository.markMissingEvaluationTopicAsAdded({
          evaluationJobId,
          topicIndex: parsedTopicIndex,
          addedTopicId: addedTopic._id.toString(),
        }),
      ])

      return {
        trackerId,
        evaluationJobId,
        missingTopicIndex: parsedTopicIndex,
        addedTopic: {
          _id: addedTopic._id.toString(),
          trackerId: addedTopic.trackerId.toString(),
          title: addedTopic.title,
          description: addedTopic.description,
          order: addedTopic.order,
        },
        placedUnder: {
          type: 'tracker',
          _id: trackerId,
          title: 'Top Level',
        },
      }
    }

    const matchedSubtopicParent = findBestMatchingParent(
      trackerSubtopics,
      suggestedParentTitle
    )

    const matchedTopicParent = matchedSubtopicParent
      ? null
      : findBestMatchingParent(trackerTopics, suggestedParentTitle)

    if (!matchedSubtopicParent && !matchedTopicParent) {
      throw new ApiError(
        404,
        `Suggested parent "${suggestedParentTitle}" was not found in this tracker`,
        'SUGGESTED_PARENT_NOT_FOUND'
      )
    }

    const topicId = matchedSubtopicParent
      ? matchedSubtopicParent.topicId.toString()
      : matchedTopicParent!._id.toString()

    const parentSubtopicId = matchedSubtopicParent
      ? matchedSubtopicParent._id.toString()
      : null

    const depth = matchedSubtopicParent ? matchedSubtopicParent.depth + 1 : 1

    const lastSibling = await this.trackerRepository.findLastSiblingSubtopic({
      topicId,
      parentSubtopicId,
    })

    const addedSubtopic = await this.trackerRepository.createTrackerSubtopic({
      trackerId,
      topicId,
      parentSubtopicId,
      title: missingTopic.title,
      description: missingTopic.description,
      order: (lastSibling?.order || 0) + 1,
      depth,
    })

    await Promise.all([
      this.trackerRepository.incrementTrackerSubtopicsCount(trackerId),
      this.trackerRepository.recomputeTopicProgress(topicId),
      this.trackerRepository.recomputeTrackerProgress(trackerId),
      this.trackerRepository.markMissingEvaluationTopicAsAdded({
        evaluationJobId,
        topicIndex: parsedTopicIndex,
        addedSubtopicId: addedSubtopic._id.toString(),
      }),
    ])

    return {
      trackerId,
      evaluationJobId,
      missingTopicIndex: parsedTopicIndex,
      addedSubtopic: {
        _id: addedSubtopic._id.toString(),
        trackerId: addedSubtopic.trackerId.toString(),
        topicId: addedSubtopic.topicId.toString(),
        parentSubtopicId: addedSubtopic.parentSubtopicId
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
            _id: matchedSubtopicParent._id.toString(),
            title: matchedSubtopicParent.title,
          }
        : {
            type: 'topic',
            _id: matchedTopicParent!._id.toString(),
            title: matchedTopicParent!.title,
          },
    }
  }
}
