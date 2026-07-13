import type { IFriendRequestRepository } from "../../domain/repositories/friend-request.repository.interface";
import type {
  FriendRequestsPageViewDTO,
  ListFriendRequestsPayloadDTO,
} from "../friends.dto";
import type { IFriendsMapper } from "../friends.mapper";

export interface IListFriendRequestsUseCase {
  execute(viewerUserId: string, payload: ListFriendRequestsPayloadDTO): Promise<FriendRequestsPageViewDTO>
}

export class ListFriendRequestsUseCase implements IListFriendRequestsUseCase {
  constructor(
    private readonly _friendRequestRepository: IFriendRequestRepository,
    private readonly _friendsMapper: IFriendsMapper,
  ) {}

  async execute(
    viewerUserId: string,
    payload: ListFriendRequestsPayloadDTO,
  ): Promise<FriendRequestsPageViewDTO> {
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
