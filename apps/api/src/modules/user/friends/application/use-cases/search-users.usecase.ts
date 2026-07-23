import type { IFriendQueryRepository } from '../../domain/repositories/friend-query.repository.interface';
import type { IFriendBlockRepository } from '../../domain/repositories/friend-block.repository.interface';
import type { FriendUsersPageViewDTO, SearchUsersPayloadDTO } from '../friends.dto';
import type { IFriendsMapper } from '../friends.mapper';

export interface ISearchUsersUseCase {
  execute(viewerUserId: string, payload: SearchUsersPayloadDTO): Promise<FriendUsersPageViewDTO>;
}

export class SearchUsersUseCase implements ISearchUsersUseCase {
  constructor(
    private readonly _friendQueryRepository: IFriendQueryRepository,
    private readonly _friendBlockRepository: IFriendBlockRepository,
    private readonly _friendsMapper: IFriendsMapper
  ) {}

  async execute(viewerUserId: string, payload: SearchUsersPayloadDTO) {
    const [page, blockedByUserIds] = await Promise.all([
      this._friendQueryRepository.searchUsers({
        viewerUserId,
        query: payload.query,
        page: payload.page,
        limit: payload.limit,
      }),
      this._friendBlockRepository.listBlockedByUserIds(viewerUserId),
    ]);

    return this._friendsMapper.toFriendUsersPageView(
      page,
      new Set(blockedByUserIds)
    );
  }
}
