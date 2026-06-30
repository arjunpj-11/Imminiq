import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerMapperContract } from '../mappers/tracker.mapper'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { TrackerAIServiceContract } from '../../domain/services/tracker-ai.service.interface'

type ExistingSubtopic = {
  id: string
  title: string
  description: string
  difficulty: string
}

type VerifyTrackerSubtopicInput = {
  trackerId: string
  topicId: string
  userId: string
  trackerTitle: string
  topicTitle: string
  topicDescription: string
  subtopicTitle: string
  subtopicDescription: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  existingSubtopics: ExistingSubtopic[]
}

type VerifyTrackerSubtopicResultDto = ReturnType<
  TrackerMapperContract['toTrackerAIValidationDto']
>

export class VerifyTrackerSubtopicUseCase {
  constructor(
    private readonly _trackerRepository: TrackerRepositoryContract,
    private readonly _trackerAIService: TrackerAIServiceContract,
    private readonly _trackerMapper: TrackerMapperContract,
  ) {}

  async execute(
    input: VerifyTrackerSubtopicInput,
  ): Promise<VerifyTrackerSubtopicResultDto> {
    const tracker = await this._trackerRepository.findOwnedTrackerById({
      trackerId: input.trackerId,
      userId: input.userId,
    })

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    const result = await this._trackerAIService.verifyTrackerSubtopic({
      trackerTitle: input.trackerTitle || tracker.title || '',
      topicTitle: input.topicTitle,
      topicDescription: input.topicDescription,
      subtopicTitle: input.subtopicTitle,
      subtopicDescription: input.subtopicDescription,
      difficulty: input.difficulty,
      existingSubtopics: input.existingSubtopics,
    })

    return this._trackerMapper.toTrackerAIValidationDto(result)
  }
}