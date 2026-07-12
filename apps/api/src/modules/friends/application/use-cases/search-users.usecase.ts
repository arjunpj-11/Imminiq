import type { IFriendQueryRepository } from "../../domain/repositories/friend-query.repository.interface";
import type { SearchUsersPayloadDTO } from "../dtos/friends.dto";
import type { IFriendsMapper } from "../mappers/friends.mapper";

export interface ISearchUsersUseCase {
  execute(viewerUserId: string, payload: SearchUsersPayloadDTO): Promise<import("../dtos/friends.dto").FriendUsersPageViewDTO>
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
