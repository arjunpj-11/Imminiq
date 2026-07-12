import type { IFriendQueryRepository } from "../../domain/repositories/friend-query.repository.interface";
import type { SearchUsersPayloadDTO } from "../friends.dto";
import type { IFriendsMapper } from "../friends.mapper";

export interface ISearchUsersUseCase {
  execute(viewerUserId: string, payload: SearchUsersPayloadDTO): Promise<import("../friends.dto").FriendUsersPageViewDTO>
}

export class SearchUsersUseCase implements ISearchUsersUseCase {
  constructor(
    private readonly _friendQueryRepository: IFriendQueryRepository,
    private readonly _friendsMapper: IFriendsMapper,
  ) {}

  async execute(viewerUserId: string, payload: SearchUsersPayloadDTO) {
    const page = await this._friendQueryRepository.searchUsers({
      viewerUserId,
      query: payload.query,
      page: payload.page,
      limit: payload.limit,
    });

    return this._friendsMapper.toFriendUsersPageView(page);
  }
}
