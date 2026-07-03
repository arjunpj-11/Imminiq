import type { FriendQueryRepositoryContract } from "../../domain/repositories/friend-query.repository.interface";
import type { SearchUsersPayload } from "../dtos/friends.dto";
import type { FriendsMapperContract } from "../mappers/friends.mapper";

export class SearchUsersUseCase {
  constructor(
    private readonly _friendQueryRepository: FriendQueryRepositoryContract,
    private readonly _friendsMapper: FriendsMapperContract,
  ) {}

  async execute(viewerUserId: string, payload: SearchUsersPayload) {
    const page = await this._friendQueryRepository.searchUsers({
      viewerUserId,
      query: payload.query,
      page: payload.page,
      limit: payload.limit,
    });

    return this._friendsMapper.toFriendUsersPageView(page);
  }
}
