import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { DifficultyLevel } from '../dtos/mock-tests.dto'
import type { MockTestsMapperContract } from '../mappers/mock-tests.mapper'

export class ListPublicMockTestsUseCase {
  constructor(
    private readonly _repository: MockTestRepositoryContract,
    private readonly _mapper: MockTestsMapperContract,
  ) { }

  execute(filters: {
    difficulty?: DifficultyLevel
    tags?: string[]
    page?: number
    limit?: number
  }) {
    return this._repository.findPublicTests(filters).then((result) =>
      this._mapper.toPublicListDto(result))
  }
}
