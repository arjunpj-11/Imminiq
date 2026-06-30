import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'

export class GetCommunityTopicsUseCase {
  constructor(private readonly _repository: CommunityRepositoryContract) {}

  execute(): Promise<string[]> {
    return this._repository.findAvailableTopics()
  }
}
