import type { IFriendQueryRepository } from '../../domain/repositories/friend-query.repository.interface';
import type { FriendUsersPageViewDTO, ListFriendsPayloadDTO } from '../friends.dto';
import type { IFriendsMapper } from '../friends.mapper';

export interface IListFriendsUseCase {
  execute(
    viewerUserId: string,
    payload: ListFriendsPayloadDTO
  ): Promise<FriendUsersPageViewDTO>;
}

export class ListFriendsUseCase implements IListFriendsUseCase {
  constructor(
    private readonly _friendQueryRepository: IFriendQueryRepository,
    private readonly _friendsMapper: IFriendsMapper
  ) {}

  async execute(viewerUserId: string, payload: ListFriendsPayloadDTO) {
    const page = await this._friendQueryRepository.listFriends({
      viewerUserId,
      page: payload.page,
      limit: payload.limit,
      ...(payload.search !== undefined ? { search: payload.search } : {}),
    });

    return this._friendsMapper.toFriendUsersPageView(page);
  }
}
