import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'

export class GetCommunityTopicsUseCase {
  constructor(private readonly _repository: ICommunityRepository) {}

  execute(): Promise<string[]> {
    return this._repository.findAvailableTopics()
  }
}
