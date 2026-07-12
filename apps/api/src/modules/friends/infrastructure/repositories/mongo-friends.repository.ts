import type { IFriendCommandRepository } from "../../domain/repositories/friend-command.repository.interface";
import type { IFriendQueryRepository } from "../../domain/repositories/friend-query.repository.interface";
import type { IFriendRequestRepository } from "../../domain/repositories/friend-request.repository.interface";
import type { IFriendsRepository } from "../../domain/repositories/friends.repository.interface";
import type {
  FriendRequestActionCommandInput,
  ListFriendRequestsInput,
  ListFriendsInput,
  RemoveFriendCommandInput,
  SearchFriendUsersInput,
  SendFriendRequestCommandInput,
} from "../../domain/types/friends.types";
import {
  MongoFriendCommandRepository,
  mongoFriendCommandRepository,
} from "./internal/mongo-friend-command.repository";
import {
  MongoFriendQueryRepository,
  mongoFriendQueryRepository,
} from "./internal/mongo-friend-query.repository";
import {
  MongoFriendRequestRepository,
  mongoFriendRequestRepository,
} from "./internal/mongo-friend-request.repository";
import { MongoFriendsMapper } from "./shared/mongo-friends.mapper";

type MongoFriendsRepositoryDependencies = {
  queryRepository: IFriendQueryRepository;
  requestRepository: IFriendRequestRepository;
  commandRepository: IFriendCommandRepository;
};

export class MongoFriendsRepository implements IFriendsRepository {
  private readonly _queryRepository: IFriendQueryRepository;
  private readonly _requestRepository: IFriendRequestRepository;
  private readonly _commandRepository: IFriendCommandRepository;

  constructor(
    mapper?: MongoFriendsMapper,
    dependencies: Partial<MongoFriendsRepositoryDependencies> = {},
  ) {
    this._queryRepository =
      dependencies.queryRepository ??
      (mapper
        ? new MongoFriendQueryRepository(mapper)
        : mongoFriendQueryRepository);

    this._requestRepository =
      dependencies.requestRepository ??
      (mapper
        ? new MongoFriendRequestRepository(mapper)
        : mongoFriendRequestRepository);

    this._commandRepository =
      dependencies.commandRepository ??
      (mapper
        ? new MongoFriendCommandRepository(mapper)
        : mongoFriendCommandRepository);
  }

  searchUsers(input: SearchFriendUsersInput) {
    return this._queryRepository.searchUsers(input);
  }

  listFriends(input: ListFriendsInput) {
    return this._queryRepository.listFriends(input);
  }

  findFriendUser(viewerUserId: string, friendUserId: string) {
    return this._queryRepository.findFriendUser(viewerUserId, friendUserId);
  }

  listReceivedRequests(input: ListFriendRequestsInput) {
    return this._requestRepository.listReceivedRequests(input);
  }

  listSentRequests(input: ListFriendRequestsInput) {
    return this._requestRepository.listSentRequests(input);
  }

  sendFriendRequest(input: SendFriendRequestCommandInput) {
    return this._commandRepository.sendFriendRequest(input);
  }

  acceptFriendRequest(input: FriendRequestActionCommandInput) {
    return this._commandRepository.acceptFriendRequest(input);
  }

  declineFriendRequest(input: FriendRequestActionCommandInput) {
    return this._commandRepository.declineFriendRequest(input);
  }

  cancelFriendRequest(input: FriendRequestActionCommandInput) {
    return this._commandRepository.cancelFriendRequest(input);
  }

  removeFriend(input: RemoveFriendCommandInput) {
    return this._commandRepository.removeFriend(input);
  }
}

export const mongoFriendsRepository = new MongoFriendsRepository();
