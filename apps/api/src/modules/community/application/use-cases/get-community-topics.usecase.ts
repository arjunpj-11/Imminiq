import type { ICommunityRepository } from '../../domain/repositories/community.repository.interface'

export interface IGetCommunityTopicsUseCase {
  execute(): Promise<string[]>
}

export class GetCommunityTopicsUseCase implements IGetCommunityTopicsUseCase {
  constructor(private readonly _repository: ICommunityRepository) {}

  execute(): Promise<string[]> {
    return this._repository.findAvailableTopics()
  }
}
