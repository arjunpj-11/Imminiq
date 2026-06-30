// apps/api/src/modules/trackers/application/use-cases/publish-tracker.usecase.ts

import { TrackerApplicationError } from '../errors/tracker-application.error'
import type { TrackerRepositoryContract } from '../../domain/repositories/tracker.repository.interface'
import type { PublishTrackerInput } from '../../domain/types/trackers.types'
import { TrackerMapperContract } from '../mappers'

export class PublishTrackerUseCase {
  constructor(private readonly _trackerRepository: TrackerRepositoryContract,private readonly trackerMapper: TrackerMapperContract) {}

  async execute(input: PublishTrackerInput) {
  
    const tracker = await this._trackerRepository.publishOwnedTracker(input)

    if (!tracker) {
      throw TrackerApplicationError.trackerNotFound('Tracker not found')
    }

    return this.trackerMapper.toTrackerDto(tracker)
  }
}