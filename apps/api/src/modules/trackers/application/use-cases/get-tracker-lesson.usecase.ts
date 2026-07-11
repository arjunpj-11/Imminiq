// apps/api/src/modules/trackers/application/use-cases/get-tracker-lesson.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIGatewayContract } from '../../domain/services/tracker-ai.interface'
import type { SubtopicWithProgressRecord } from '../../domain/types/trackers.types'

type GetTrackerLessonResultDto = ReturnType<
  TrackerMapperContract['toGeneratedLessonDto']
>

const flattenSubtopics = (subtopics: SubtopicWithProgressRecord[]) => {
  return [...subtopics].sort((a, b) => {
    if (a.topicId.toString() !== b.topicId.toString()) {
      return a.topicId.toString().localeCompare(b.topicId.toString())
    }

    if (a.depth !== b.depth) {
      return a.depth - b.depth
    }

    return a.order - b.order
  })
}

export class GetTrackerLessonUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerAIGateway: TrackerAIGatewayContract,
    private readonly _trackerMapper: TrackerMapperContract,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }): Promise<GetTrackerLessonResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    await this._trackerRepository.ensureUserProgressInitialized({
      userId: input.userId,
      trackerId: input.trackerId,
    })

    const [topics, subtopics] = await Promise.all([
      this._trackerRepository.getTopicsForTracker(input.trackerId),
      this._trackerRepository.getSubtopicsWithUserProgress({
        trackerId: input.trackerId,
        userId: input.userId,
      }),
    ])

    const currentSubtopic = subtopics.find((subtopic) => {
      return subtopic._id.toString() === input.subtopicId
    })

    if (!currentSubtopic) {
      throw TrackerApplicationError.lessonNodeNotFound('Lesson node not found')
    }

    const topic = topics.find((item) => {
      return item._id.toString() === currentSubtopic.topicId.toString()
    })

    let lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      const generated = await this._trackerAIGateway.generateLesson({
        trackerTitle: tracker.title || 'Tracker',
        topicTitle: topic?.title,
        subtopicTitle: currentSubtopic.title,
        subtopicDescription: currentSubtopic.description,
        level: 'beginner',
      })

      lesson = await this._trackerRepository.createLesson({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        ...generated,
      })
    }

    const flatSubtopics = flattenSubtopics(subtopics)

    const currentIndex = flatSubtopics.findIndex((subtopic) => {
      return subtopic._id.toString() === input.subtopicId
    })

    const previousSubtopic =
      currentIndex > 0 ? flatSubtopics[currentIndex - 1] : null

    const nextSubtopic =
      currentIndex >= 0 && currentIndex < flatSubtopics.length - 1
        ? flatSubtopics[currentIndex + 1]
        : null

    const result = {
      tracker,
      lessonNode: {
        _id: currentSubtopic._id.toString(),
        trackerId: currentSubtopic.trackerId.toString(),
        topicId: currentSubtopic.topicId.toString(),
        parentSubtopicId: currentSubtopic.parentSubtopicId?.toString() || null,
        title: currentSubtopic.title,
        description: currentSubtopic.description,
        order: currentSubtopic.order,
        depth: currentSubtopic.depth,
        status: currentSubtopic.status,
        isLocked: currentSubtopic.isLocked,
        progressPercent: currentSubtopic.progressPercent,
        topicTitle: topic?.title || '',
      },
      generatedLesson: lesson,
      previousLesson: previousSubtopic
        ? {
            _id: previousSubtopic._id.toString(),
            title: previousSubtopic.title,
          }
        : null,
      nextLesson: nextSubtopic
        ? {
            _id: nextSubtopic._id.toString(),
            title: nextSubtopic.title,
          }
        : null,
      lessonRoadmap: flatSubtopics.map((subtopic) => ({
        _id: subtopic._id.toString(),
        title: subtopic.title,
        status: subtopic.status,
        isLocked: subtopic.isLocked,
        estimatedMinutes: subtopic.estimatedMinutes || 5,
      })),
    }

    return this._trackerMapper.toGeneratedLessonDto(result)
  }
}