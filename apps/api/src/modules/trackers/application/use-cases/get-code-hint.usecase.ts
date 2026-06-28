import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

type GetCodeHintInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  actualOutput?: string
  errorOutput?: string
  hintCount: number
}

type GetCodeHintResultDto = ReturnType<
  TrackerMapperContract['toLessonCodeHintDto']
>

export class GetCodeHintUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerAIService: TrackerAIServiceContract,
    private readonly _trackerMapper: TrackerMapperContract
  ) {}

  async execute(input: GetCodeHintInput): Promise<GetCodeHintResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const lesson = await this._trackerRepository.findGeneratedLessonBySubtopic({
      trackerId: input.trackerId,
      subtopicId: input.subtopicId,
      userId: input.userId,
    })

    const aiResult = await this._trackerAIService.generateCodeHint({
      lessonTitle: lesson?.title || tracker.title || 'Coding lesson',
      practiceTitle: lesson?.practiceTask?.title || 'Coding practice',
      practiceDescription:
        lesson?.practiceTask?.description ||
        'Find the issue in the submitted code.',
      expectedOutput: lesson?.practiceTask?.expectedOutput || '',
      sourceCode: input.sourceCode,
      actualOutput: input.actualOutput,
      errorOutput: input.errorOutput,
      hintCount: input.hintCount,
    })

    return this._trackerMapper.toLessonCodeHintDto({
      mode: aiResult.mode,
      hintCount: input.hintCount + 1,
      title: aiResult.title,
      explanation: aiResult.explanation,
    })
  }
}