import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

export class ChatWithLessonTutorUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository,
    private readonly trackerAIService: TrackerAIServiceContract
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    messages: {
      role: 'user' | 'assistant'
      content: string
    }[]
  }) {
    const tracker = await this.trackerRepository.findOwnedTrackerById(
      input.trackerId,
      input.userId
    )

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    const lesson = await this.trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw new ApiError(
        404,
        'Generate the lesson before chatting',
        'LESSON_NOT_GENERATED'
      )
    }

    const latestUserMessage = [...input.messages]
      .reverse()
      .find((message) => message.role === 'user')

    const lessonId =
      typeof lesson._id === 'string'
        ? lesson._id
        : lesson._id?.toString?.() ?? null

    if (latestUserMessage?.content?.trim()) {
      await this.trackerRepository.createLessonChatMessage({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId,
        scope: 'lesson_doubt_chat',
        role: 'user',
        content: latestUserMessage.content.trim(),
      })
    }

    const answer = await this.trackerAIService.chatWithLessonTutor({
      lessonTitle: lesson.title,
      lessonContent: `${lesson.summary}\n\n${lesson.explanation}\n\n${lesson.insight}`,
      messages: input.messages,
    })

    if (answer?.trim()) {
      await this.trackerRepository.createLessonChatMessage({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId,
        scope: 'lesson_doubt_chat',
        role: 'assistant',
        content: answer.trim(),
      })
    }

    return {
      answer,
    }
  }
}
