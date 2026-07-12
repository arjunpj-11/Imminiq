// apps/api/src/modules/trackers/application/use-cases/ask-lesson-question-solution-doubt.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { ITrackerMapper } from '../mappers/tracker.mapper'
import type { ITrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { ITrackerAIGateway } from '../../domain/services/tracker-ai.interface'
import type { IQuestionHasher } from '../../domain/services/question-hasher.interface'

type AskLessonQuestionSolutionDoubtResultDTO = ReturnType<
  ITrackerMapper['toLessonQuestionSolutionDoubtAnswerDto']
>

const getDocumentId = (document: unknown) => {
  const doc = document as { _id?: unknown }

  if (typeof doc._id === 'string') {
    return doc._id
  }

  if (doc._id && typeof doc._id === 'object' && 'toString' in doc._id) {
    return doc._id.toString()
  }

  return null
}

export interface IAskLessonQuestionSolutionDoubtUseCase {
  execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
    message: string
  }): Promise<AskLessonQuestionSolutionDoubtResultDTO>
}

export class AskLessonQuestionSolutionDoubtUseCase implements IAskLessonQuestionSolutionDoubtUseCase {
  constructor(
    private readonly _trackerRepository: ITrackerRepository,
    private readonly _trackerAIGateway: ITrackerAIGateway,
    private readonly _questionHasher: IQuestionHasher,
    private readonly _trackerMapper: ITrackerMapper,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
    message: string
  }): Promise<AskLessonQuestionSolutionDoubtResultDTO> {
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
        'Generate the lesson before asking solution doubt',
      )
    }

    const questionHash = this._questionHasher.hash(input.question)

    const solution = await this._trackerRepository.findLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      questionHash,
    })

    if (!solution) {
      throw TrackerApplicationError.solutionNotGenerated(
        'Generate the solution before asking doubts',
      )
    }

    const typedSolution = solution as {
      _id?: unknown
      solution?: string
    }

    const solutionText = typedSolution.solution || ''

    if (!solutionText) {
      throw TrackerApplicationError.solutionEmpty('Saved solution is empty')
    }

    const lessonId = getDocumentId(lesson)
    const solutionId = getDocumentId(solution)

    await this._trackerRepository.createLessonQuestionSolutionDoubt({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId,
      solutionId,
      question: input.question,
      questionHash,
      role: 'user',
      content: input.message,
    })

    const history =
      await this._trackerRepository.getLessonQuestionSolutionDoubts({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        questionHash,
      })

    const messages = history.map((item) => {
      const message = item as {
        role: 'user' | 'assistant'
        content: string
      }

      return {
        role: message.role,
        content: message.content,
      }
    })

 const answer =
  await this._trackerAIGateway.chatWithLessonQuestionSolutionDoubt({
    lessonTitle: lesson.title,
    lessonExplanation: lesson.explanation,
    question: input.question,
    solution: solutionText,
    messages,
  })
    await this._trackerRepository.createLessonQuestionSolutionDoubt({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId,
      solutionId,
      question: input.question,
      questionHash,
      role: 'assistant',
      content: answer,
    })

    return this._trackerMapper.toLessonQuestionSolutionDoubtAnswerDto({
      answer,
    })
  }
}