// apps/api/src/modules/trackers/application/use-cases/chat-with-lesson-tutor.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

type ChatWithLessonTutorResultDto = ReturnType<
  TrackerMapperContract['toLessonTutorChatResponseDto']
>

export class ChatWithLessonTutorUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerAIService: TrackerAIServiceContract,
    private readonly _trackerMapper: TrackerMapperContract,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    messages: {
      role: 'user' | 'assistant'
      content: string
    }[]
  }): Promise<ChatWithLessonTutorResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated(
        'Generate the lesson before chatting',
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
      await this._trackerRepository.createLessonChatMessage({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId,
        scope: 'lesson_doubt_chat',
        role: 'user',
        content: latestUserMessage.content.trim(),
      })
    }

    const answer = await this._trackerAIService.chatWithLessonTutor({
      lessonTitle: lesson.title,
      lessonContent: `${lesson.summary}\n\n${lesson.explanation}\n\n${lesson.insight}`,
      messages: input.messages,
    })

    if (answer?.trim()) {
      await this._trackerRepository.createLessonChatMessage({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId,
        scope: 'lesson_doubt_chat',
        role: 'assistant',
        content: answer.trim(),
      })
    }

    return this._trackerMapper.toLessonTutorChatResponseDto({
      answer,
    })
  }
}