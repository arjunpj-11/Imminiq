// apps/api/src/modules/trackers/application/use-cases/publish-tracker.usecase.ts

import { ApiError } from '../../../../shared/utils/ApiError'
import type { TrackerRepository } from '../../domain/repositories/tracker.repository.interface'
import type { PublishTrackerInput } from '../../domain/types/trackers.types'

export class PublishTrackerUseCase {
  constructor(private readonly trackerRepository: TrackerRepository) {}

  async execute(input: PublishTrackerInput) {
    const tracker = await this.trackerRepository.publishOwnedTracker(input)

    if (!tracker) {
      throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND')
    }

    return tracker
  }
}