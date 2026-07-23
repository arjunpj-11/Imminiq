import type { IFriendQueryRepository } from '../../domain/repositories/friend-query.repository.interface';
import type { IFriendBlockRepository } from '../../domain/repositories/friend-block.repository.interface';
import type { FriendUsersPageViewDTO, ListFriendsPayloadDTO } from '../friends.dto';
import type { IFriendsMapper } from '../friends.mapper';

export interface IListFriendsUseCase {
  execute(viewerUserId: string, payload: ListFriendsPayloadDTO): Promise<FriendUsersPageViewDTO>;
}

export class ListFriendsUseCase implements IListFriendsUseCase {
  constructor(
    private readonly _friendQueryRepository: IFriendQueryRepository,
    private readonly _friendBlockRepository: IFriendBlockRepository,
    private readonly _friendsMapper: IFriendsMapper
  ) {}

  async execute(viewerUserId: string, payload: ListFriendsPayloadDTO) {
    const [page, blockedByUserIds] = await Promise.all([
      this._friendQueryRepository.listFriends({
        viewerUserId,
        page: payload.page,
        limit: payload.limit,
        ...(payload.search !== undefined ? { search: payload.search } : {}),
      }),
      this._friendBlockRepository.listBlockedByUserIds(viewerUserId),
    ]);

    return this._friendsMapper.toFriendUsersPageView(
      page,
      new Set(blockedByUserIds)
    );
  }
}
