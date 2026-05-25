import { ApiError } from '../../../../shared/utils/ApiError'
import { verifyTrackerSubtopic } from '../../../../infrastructure/ai/ai.service'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'

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

export class VerifyTrackerSubtopicUseCase {
  constructor(
    private readonly trackerRepository: TrackerRepository
  ) {}

  async execute(input: VerifyTrackerSubtopicInput) {
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

    return verifyTrackerSubtopic({
      trackerTitle: input.trackerTitle || tracker.title || '',
      topicTitle: input.topicTitle,
      topicDescription: input.topicDescription,
      subtopicTitle: input.subtopicTitle,
      subtopicDescription: input.subtopicDescription,
      difficulty: input.difficulty,
      existingSubtopics: input.existingSubtopics,
    })
  }
}