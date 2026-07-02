import type { FriendQueryRepositoryContract } from "../../domain/repositories/friend-query.repository.interface";
import type { ListFriendsPayload } from "../dtos/friends.dto";
import type { FriendsMapperContract } from "../mappers/friends.mapper";

export class ListFriendsUseCase {
  constructor(
    private readonly _friendQueryRepository: FriendQueryRepositoryContract,
    private readonly _friendsMapper: FriendsMapperContract,
  ) {}

  async execute(viewerUserId: string, payload: ListFriendsPayload) {
    const page = await this._friendQueryRepository.listFriends({
      viewerUserId,
      page: payload.page,
      limit: payload.limit,
      ...(payload.search !== undefined ? { search: payload.search } : {}),
    });

    return this._friendsMapper.toFriendUsersPageView(page);
  }
}
