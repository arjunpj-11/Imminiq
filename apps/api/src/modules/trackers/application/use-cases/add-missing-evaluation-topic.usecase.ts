// apps/api/src/modules/trackers/application/use-cases/add-missing-evaluation-topic.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'

import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type {
  AddMissingEvaluationTopicInput,
  AddMissingEvaluationTopicResult,
  EvaluationOutputData,
  TrackerTopicRecord,
} from '../../domain/types/trackers.types'

type AddMissingEvaluationTopicDto = ReturnType<
  TrackerMapperContract['toAddMissingEvaluationTopicDto']
>

const normalizeTitle = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
}

const findBestMatchingParent = <T extends { title: string }>(
  items: T[],
  suggestedParentTitle: string,
): T | null => {
  const target = normalizeTitle(suggestedParentTitle)

  const exactMatch = items.find((item) => normalizeTitle(item.title) === target)

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

type NewTopLevelPlacement = {
  isNewTopLevel: boolean
  relation?: 'before' | 'after'
  referenceTitle?: string
}

const normalizePlacementReference = (value: string) => {
  return value
    .trim()
    .replace(/^["'""'']+/, '')
    .replace(/["'""''.)\]]+$/, '')
    .trim()
}

const parseNewTopLevelPlacement = (
  suggestedParentTitle: string,
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
    /should\s+(?:precede|come\s+before)\s+(.+?)(?:\)|$)/i,
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
  trackerRepository: TrackerRepositoryContract,
  trackerId: string,
  trackerTopics: TrackerTopicRecord[],
  placement: NewTopLevelPlacement,
): Promise<number> => {
  if (placement.referenceTitle && placement.relation) {
    const referenceTopic = findBestMatchingParent(
      trackerTopics,
      placement.referenceTitle,
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
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerMapper: TrackerMapperContract,
  ) {}

  async execute({
    trackerId,
    evaluationJobId,
    topicIndex,
    userId,
  }: AddMissingEvaluationTopicInput): Promise<AddMissingEvaluationTopicDto> {
    const parsedTopicIndex = Number(topicIndex)

    if (!Number.isInteger(parsedTopicIndex) || parsedTopicIndex < 0) {
      throw TrackerApplicationError.invalidTopicIndex(
        'Invalid missing topic index',
      )
    }

    const tracker = await this.trackerRepository.findOwnedTrackerById({
      trackerId,
      userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const evaluationJob = await this.trackerRepository.findEvaluationJobById({
      evaluationJobId,
      userId,
    })

    if (!evaluationJob) {
      throw TrackerApplicationError.evaluationJobNotFound(
        'Evaluation job not found',
      )
    }

    if (evaluationJob.status !== 'completed') {
      throw TrackerApplicationError.evaluationJobPending(
        'Evaluation job is not completed yet',
      )
    }

    const outputData = evaluationJob.outputData as
      | EvaluationOutputData
      | undefined

    if (outputData?.trackerId !== trackerId) {
      throw TrackerApplicationError.trackerEvaluationMismatch(
        'Evaluation result does not belong to this tracker',
      )
    }

    const missingTopics = outputData?.evaluation?.missingTopics

    if (!Array.isArray(missingTopics)) {
      throw TrackerApplicationError.missingTopicsNotFound(
        'Missing topic suggestions not found',
      )
    }

    const missingTopic = missingTopics[parsedTopicIndex]

    if (!missingTopic) {
      throw TrackerApplicationError.missingTopicNotFound(
        'Missing topic suggestion not found',
      )
    }

    if (
      missingTopic.isAdded ||
      missingTopic.addedSubtopicId ||
      missingTopic.addedTopicId
    ) {
      throw TrackerApplicationError.missingTopicAlreadyAdded(
        'This missing topic has already been added',
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
        newTopLevelPlacement,
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

      const result: AddMissingEvaluationTopicResult = {
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

      return this.trackerMapper.toAddMissingEvaluationTopicDto(result)
    }

    const matchedSubtopicParent = findBestMatchingParent(
      trackerSubtopics,
      suggestedParentTitle,
    )

    const matchedTopicParent = matchedSubtopicParent
      ? null
      : findBestMatchingParent(trackerTopics, suggestedParentTitle)

    if (!matchedSubtopicParent && !matchedTopicParent) {
      throw TrackerApplicationError.suggestedParentNotFound(
        `Suggested parent "${suggestedParentTitle}" was not found in this tracker`,
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
      this.trackerRepository.recomputeTrackerProgress({
        trackerId,
        userId,
      }),
      this.trackerRepository.markMissingEvaluationTopicAsAdded({
        evaluationJobId,
        topicIndex: parsedTopicIndex,
        addedSubtopicId: addedSubtopic._id.toString(),
      }),
    ])

    const result: AddMissingEvaluationTopicResult = {
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

    return this.trackerMapper.toAddMissingEvaluationTopicDto(result)
  }
}