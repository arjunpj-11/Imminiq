import type { MockTestRepositoryContract } from '../../domain/repositories/mock-test.repository.interface'
import type { DifficultyLevel } from '../dtos/mock-tests.dto'

export class ListPublicMockTestsUseCase {
  constructor(private readonly _repo: MockTestRepositoryContract) { }

  execute(filters: {
    difficulty?: DifficultyLevel
    tags?: string[]
    page?: number
    limit?: number
  }) {
    return this._repo.findPublicTests(filters)
  }
}
