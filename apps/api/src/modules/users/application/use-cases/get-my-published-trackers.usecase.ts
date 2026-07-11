import type { IUserTrackerRepository } from '../../domain/repositories/user-tracker.repository.interface'
import type { IPaginationQueryDTO } from '../dtos/users.dto'
import type { IUsersMapper } from '../mappers/users.mapper'

export class GetMyPublishedTrackersUseCase {
  constructor(
    private readonly _usersRepository: IUserTrackerRepository,
    private readonly _usersMapper: IUsersMapper,
  ) {}

  async execute(userId: string, query: IPaginationQueryDTO) {
    const { items, total } =
      await this._usersRepository.findPublishedTrackers({
        ownerId: userId,
        query,
        includePrivate: false,
      })

    return {
      items: items.map((item) =>
        this._usersMapper.toPublishedTrackerView(item),
      ),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    }
  }
}