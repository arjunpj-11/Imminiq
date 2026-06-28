// apps/api/src/modules/community/application/use-cases/clone-community-tracker.usecase.ts

import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'
import { CommunityApplicationError } from '../errors/community-application.error'
import type { CommunityMapperContract } from '../mappers/community.mapper'

export class CloneCommunityTrackerUseCase {
  constructor(
    private readonly _repository: CommunityRepositoryContract,
    private readonly _mapper: CommunityMapperContract,
  ) {}

  async execute(trackerId: string, userId: string) {
    const tracker = await this._repository.cloneTrackerForUser(trackerId, userId)

    if (!tracker) {
      throw CommunityApplicationError.notFound(
        'Community tracker not found or cannot be cloned',
      )
    }

    return {
      tracker: this._mapper.toTrackerView(tracker),
    }
  }
}