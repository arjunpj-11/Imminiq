import type { IUserTrackerRepository } from '../../domain/repositories/user-tracker.repository.interface';
import type { PaginationQueryDTO } from '../users.dto';
import type { IUsersMapper } from '../users.mapper';

export interface IGetMyPublishedTrackersUseCase {
  execute(
    userId: string,
    query: PaginationQueryDTO
  ): Promise<{
    items: import('../users.dto').PublishedTrackerViewDTO[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>;
}

export class GetMyPublishedTrackersUseCase implements IGetMyPublishedTrackersUseCase {
  constructor(
    private readonly _usersRepository: IUserTrackerRepository,
    private readonly _usersMapper: IUsersMapper
  ) {}

  async execute(userId: string, query: PaginationQueryDTO) {
    const { items, total } = await this._usersRepository.findPublishedTrackers({
      ownerId: userId,
      query,
      includePrivate: false,
    });

    return {
      items: items.map((item) => this._usersMapper.toPublishedTrackerView(item)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  }
}
