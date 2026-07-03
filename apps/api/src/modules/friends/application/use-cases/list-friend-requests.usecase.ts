import type { FriendRequestRepositoryContract } from "../../domain/repositories/friend-request.repository.interface";
import type {
  FriendRequestsPageView,
  ListFriendRequestsPayload,
} from "../dtos/friends.dto";
import type { FriendsMapperContract } from "../mappers/friends.mapper";

export class ListFriendRequestsUseCase {
  constructor(
    private readonly _friendRequestRepository: FriendRequestRepositoryContract,
    private readonly _friendsMapper: FriendsMapperContract,
  ) {}

  async execute(
    viewerUserId: string,
    payload: ListFriendRequestsPayload,
  ): Promise<FriendRequestsPageView> {
    const [received, sent] = await Promise.all([
      this._friendRequestRepository.listReceivedRequests({
        viewerUserId,
        page: payload.receivedPage,
        limit: payload.limit,
      }),
      this._friendRequestRepository.listSentRequests({
        viewerUserId,
        page: payload.sentPage,
        limit: payload.limit,
      }),
    ]);

    return {
      received: {
        items: received.items.map((item) =>
          this._friendsMapper.toFriendRequestView(item),
        ),
        pagination: this._friendsMapper.toPaginationView(received),
      },
      sent: {
        items: sent.items.map((item) =>
          this._friendsMapper.toFriendRequestView(item),
        ),
        pagination: this._friendsMapper.toPaginationView(sent),
      },
      pendingReceivedCount: received.total,
    };
  }
}
