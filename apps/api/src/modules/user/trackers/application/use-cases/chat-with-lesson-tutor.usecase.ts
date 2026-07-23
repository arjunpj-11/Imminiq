// apps/api/src/modules/user/trackers/application/use-cases/chat-with-lesson-tutor.usecase.ts

import { TrackerApplicationError } from '../tracker-application.error';
import type { ITrackerMapper } from '../tracker.mapper';
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface';
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface';
import type { ChatWithLessonTutorPayloadDTO, LessonTutorChatResponseDTO } from '../tracker.dto';

export interface IChatWithLessonTutorUseCase {
  execute(input: ChatWithLessonTutorPayloadDTO): Promise<LessonTutorChatResponseDTO>;
}

export class ChatWithLessonTutorUseCase implements IChatWithLessonTutorUseCase {
  constructor(
    private readonly _trackerRepository: Pick<
      ITrackerRepository,
      'createLessonChatMessage' | 'findLessonBySubtopicId' | 'findOwnedTrackerById'
    >,
    private readonly _trackerAIGateway: Pick<ITrackerAIGateway, 'chatWithLessonTutor'>,
    private readonly _trackerMapper: ITrackerMapper
  ) {}

  async execute(input: ChatWithLessonTutorPayloadDTO): Promise<LessonTutorChatResponseDTO> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    });

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found');
    }

    const lesson = await this._trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    });

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated('Generate the lesson before chatting');
    }

    const latestUserMessage = [...input.messages]
      .reverse()
      .find((message) => message.role === 'user');

    const lessonId = lesson._id;

    if (latestUserMessage?.content?.trim()) {
      await this._trackerRepository.createLessonChatMessage({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId,
        scope: 'lesson_doubt_chat',
        role: 'user',
        content: latestUserMessage.content.trim(),
      });
    }

    const answer = await this._trackerAIGateway.chatWithLessonTutor({
      lessonTitle: lesson.title,
      lessonContent: `${lesson.summary}\n\n${lesson.explanation}\n\n${lesson.insight}`,
      messages: input.messages,
    });

    if (answer?.trim()) {
      await this._trackerRepository.createLessonChatMessage({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        lessonId,
        scope: 'lesson_doubt_chat',
        role: 'assistant',
        content: answer.trim(),
      });
    }

    return this._trackerMapper.toLessonTutorChatResponseDto({
      answer,
    });
  }
}
