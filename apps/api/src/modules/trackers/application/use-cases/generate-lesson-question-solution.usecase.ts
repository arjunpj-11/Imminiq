// apps/api/src/modules/trackers/application/use-cases/generate-lesson-question-solution.usecase.ts

import { createHash } from 'crypto'

import { ApiError } from '../../../../shared/utils/ApiError'
import { generateLessonQuestionSolution } from '../../../../infrastructure/ai/ai.service'
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

export class GenerateLessonQuestionSolutionUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    question: string
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
        'Generate the lesson before generating solution',
        'LESSON_NOT_GENERATED'
      )
    }

    const questionHash = hashQuestion(input.question)

    const existing =
      await this.trackerRepository.findLessonQuestionSolution({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
        questionHash,
      })

    if (existing) return existing

    const solution = await generateLessonQuestionSolution({
      lessonTitle: lesson.title,
      lessonExplanation: lesson.explanation,
      question: input.question,
    })

    return this.trackerRepository.createLessonQuestionSolution({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: getDocumentId(lesson),
      question: input.question,
      questionHash,
      solution,
    })
  }
}