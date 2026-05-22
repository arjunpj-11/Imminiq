import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import { generateLesson } from '../../../../infrastructure/ai/ai.service'

const flattenSubtopics = (
  subtopics: Awaited<
    ReturnType<TrackerRepository['getSubtopicsForTracker']>
  >
) => {
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
    private readonly trackerRepository: TrackerRepository
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
  }) {
    const tracker =
      await this.trackerRepository.findOwnedTrackerById(
        input.trackerId,
        input.userId
      )

    if (!tracker) {
      throw new ApiError(
        404,
        'Tracker not found',
        'TRACKER_NOT_FOUND'
      )
    }

    const [topics, subtopics] = await Promise.all([
      this.trackerRepository.getTopicsForTracker(input.trackerId),
      this.trackerRepository.getSubtopicsForTracker(input.trackerId),
    ])

    const currentSubtopic = subtopics.find(
      (subtopic) =>
        subtopic._id.toString() === input.subtopicId
    )

    if (!currentSubtopic) {
      throw new ApiError(
        404,
        'Lesson node not found',
        'LESSON_NODE_NOT_FOUND'
      )
    }

    const topic = topics.find(
      (item) =>
        item._id.toString() ===
        currentSubtopic.topicId.toString()
    )

    let lesson =
      await this.trackerRepository.findLessonBySubtopicId({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      })

    if (!lesson) {
      const generated = await generateLesson({
        trackerTitle: tracker.title || 'Tracker',
        topicTitle: topic?.title,
        subtopicTitle: currentSubtopic.title,
        subtopicDescription: currentSubtopic.description,
        level: 'beginner',
      })

      lesson = await this.trackerRepository.createLesson({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        ...generated,
      })
    }

    const flatSubtopics = flattenSubtopics(subtopics)

    const currentIndex = flatSubtopics.findIndex(
      (subtopic) =>
        subtopic._id.toString() === input.subtopicId
    )

    const previousSubtopic =
      currentIndex > 0 ? flatSubtopics[currentIndex - 1] : null

    const nextSubtopic =
      currentIndex >= 0 &&
      currentIndex < flatSubtopics.length - 1
        ? flatSubtopics[currentIndex + 1]
        : null

    return {
      tracker,
      lessonNode: {
        _id: currentSubtopic._id.toString(),
        trackerId: currentSubtopic.trackerId.toString(),
        topicId: currentSubtopic.topicId.toString(),
        parentSubtopicId:
          currentSubtopic.parentSubtopicId?.toString() || null,
        title: currentSubtopic.title,
        description: currentSubtopic.description,
        order: currentSubtopic.order,
        depth: currentSubtopic.depth,
        status: currentSubtopic.status || 'available',
        isLocked: Boolean(currentSubtopic.isLocked),
        progressPercent: currentSubtopic.progressPercent || 0,
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
        status: subtopic.status || 'available',
        isLocked: Boolean(subtopic.isLocked),
        estimatedMinutes: subtopic.estimatedMinutes || 5,
      })),
    }
  }
}