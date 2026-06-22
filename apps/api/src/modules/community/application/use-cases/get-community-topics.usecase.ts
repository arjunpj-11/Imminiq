import type { CommunityRepositoryContract } from '../../domain/repositories/community.repository.interface'

export class GetCommunityTopicsUseCase {
  constructor(private readonly repository: CommunityRepositoryContract) {}

  execute(): Promise<string[]> {
    return this.repository.findAvailableTopics()
  }
}
