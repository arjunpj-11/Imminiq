import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'
import type { QuestionHasherServiceContract } from '../../domain/services/question-hasher.service.interface'

type GenerateLessonQuestionsResultDto = ReturnType<
  TrackerMapperContract['toLessonGeneratedQuestionsDto']
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

export class GenerateLessonQuestionsUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepositoryContract,
    private readonly trackerAIService: TrackerAIServiceContract,
    private readonly questionHasher: QuestionHasherServiceContract,
    private readonly trackerMapper: TrackerMapperContract,
  ) {}

  async execute(input: {
    trackerId: string
    subtopicId: string
    userId: string
    count?: number
  }): Promise<GenerateLessonQuestionsResultDto> {
    const tracker = await this.trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lesson = await this.trackerRepository.findLessonBySubtopicId({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    if (!lesson) {
      throw TrackerApplicationError.lessonNotGenerated(
        'Generate the lesson before generating questions',
      )
    }

    const generated =
      await this.trackerAIService.generateLessonPracticeQuestions({
        lessonTitle: lesson.title,
        lessonSummary: lesson.summary,
        lessonExplanation: lesson.explanation,
        count: input.count,
      })

    await this.trackerRepository.createLessonGeneratedQuestions({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
      lessonId: getDocumentId(lesson),
      questions: generated.questions.map((question) => ({
        question,
        questionHash: this.questionHasher.hash(question),
        source: 'ai_generated',
      })),
    })

    const questions = await this.trackerRepository.getLessonGeneratedQuestions({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    return this.trackerMapper.toLessonGeneratedQuestionsDto(questions)
  }
}