// apps/api/src/modules/trackers/application/use-cases/get-code-hint.usecase.ts

import { ApiError } from '../../../../shared/utils/ApiError'
import { generateCodeHint } from '../../../../infrastructure/ai/ai.service'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

type GetCodeHintInput = {
  trackerId: string
  subtopicId: string
  userId: string
  sourceCode: string
  actualOutput?: string
  errorOutput?: string
  hintCount: number
}

export class GetCodeHintUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository
  ) {}

  async execute(input: GetCodeHintInput) {
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

    const lesson =
      await this.trackerRepository.findGeneratedLessonBySubtopic({
        trackerId: input.trackerId,
        subtopicId: input.subtopicId,
        userId: input.userId,
      })

    const aiResult = await generateCodeHint({
      lessonTitle: lesson?.title || tracker.title || 'Coding lesson',
      practiceTitle:
        lesson?.practiceTask?.title || 'Coding practice',
      practiceDescription:
        lesson?.practiceTask?.description ||
        'Find the issue in the submitted code.',
      expectedOutput: lesson?.practiceTask?.expectedOutput || '',
      sourceCode: input.sourceCode,
      actualOutput: input.actualOutput,
      errorOutput: input.errorOutput,
      hintCount: input.hintCount,
    })

    return {
      mode: aiResult.mode,
      hintCount: input.hintCount + 1,
      title: aiResult.title,
      explanation: aiResult.explanation,
    }
  }
}