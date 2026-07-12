import type { IMockTestRepository } from '../../domain/repositories/mock-test.repository.interface'
import type { DifficultyLevel } from '../dtos/mock-tests.dto'
import type { IMockTestsMapper } from '../mappers/mock-tests.mapper'

export interface IListPublicMockTestsUseCase {
  execute(filters: {
    difficulty?: DifficultyLevel
    tags?: string[]
    page?: number
    limit?: number
  }): Promise<import("../dtos/mock-tests.dto").IPublicMockTestListDTO>
}

export class ListPublicMockTestsUseCase implements IListPublicMockTestsUseCase {
  constructor(
    private readonly _repository: IMockTestRepository,
    private readonly _mapper: IMockTestsMapper,
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
