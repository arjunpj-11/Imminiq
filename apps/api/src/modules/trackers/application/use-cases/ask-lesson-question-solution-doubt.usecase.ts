// apps/api/src/modules/trackers/application/use-cases/ask-lesson-question-solution-doubt.usecase.ts

import { createHash } from 'crypto'

import { ApiError } from '../../../../shared/utils/ApiError'
import { chatWithLessonQuestionSolutionDoubt } from '../../../../infrastructure/ai/ai.service'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

const hashQuestion = (question: string) =>
  createHash('sha256').update(question.trim().toLowerCase()).digest('hex')

const getDocumentId = (document: unknown) => {
  const doc = document as { _id?: unknown }

  if (typeof doc._id === 'string') return doc._id

  if (
    doc._id &&
    typeof doc._id === 'object' &&
    'toString' in doc._id
  ) {
    return doc._id.toString()
  }

  return null
}

export class AskLessonQuestionSolutionDoubtUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
    message: string
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
        'Generate the lesson before asking solution doubt',
        'LESSON_NOT_GENERATED'
      )
    }

    const questionHash = hashQuestion(input.question)

    const solution =
      await this.trackerRepository.findLessonQuestionSolution({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        questionHash,
      })

    if (!solution) {
      throw new ApiError(
        404,
        'Generate the solution before asking doubts',
        'SOLUTION_NOT_GENERATED'
      )
    }

    const typedSolution = solution as {
      _id?: unknown
      solution?: string
    }

    const solutionText = typedSolution.solution || ''

    if (!solutionText) {
      throw new ApiError(
        409,
        'Saved solution is empty',
        'SOLUTION_EMPTY'
      )
    }

    const lessonId = getDocumentId(lesson)
    const solutionId = getDocumentId(solution)

    await this.trackerRepository.createLessonQuestionSolutionDoubt({
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
      await this.trackerRepository.getLessonQuestionSolutionDoubts({
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

    const answer = await chatWithLessonQuestionSolutionDoubt({
      lessonTitle: lesson.title,
      lessonExplanation: lesson.explanation,
      question: input.question,
      solution: solutionText,
      messages,
    })

    await this.trackerRepository.createLessonQuestionSolutionDoubt({
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

    return {
      answer,
    }
  }
}