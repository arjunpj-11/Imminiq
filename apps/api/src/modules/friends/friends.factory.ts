import type { FriendsUseCases } from './application/contracts/friends-use-cases.contract'
import { FriendsMapper } from "./application/mappers/friends.mapper";
import { FriendRelationshipPolicy } from "./application/policies/friend-relationship.policy";
import { AcceptFriendRequestUseCase } from "./application/use-cases/accept-friend-request.usecase";
import { CancelFriendRequestUseCase } from "./application/use-cases/cancel-friend-request.usecase";
import { DeclineFriendRequestUseCase } from "./application/use-cases/decline-friend-request.usecase";
import { ListFriendRequestsUseCase } from "./application/use-cases/list-friend-requests.usecase";
import { ListFriendsUseCase } from "./application/use-cases/list-friends.usecase";
import { RemoveFriendUseCase } from "./application/use-cases/remove-friend.usecase";
import { SearchUsersUseCase } from "./application/use-cases/search-users.usecase";
import { SendFriendRequestUseCase } from "./application/use-cases/send-friend-request.usecase";
import { mongoFriendsRepository } from "./infrastructure/repositories/mongo-friends.repository";

;

export type FriendsComposition = {
  useCases: FriendsUseCases;
};

export const createFriendsComposition = (): FriendsComposition => {
  const friendsRepository = mongoFriendsRepository;
  const friendsMapper = new FriendsMapper();
  const relationshipPolicy = new FriendRelationshipPolicy();

  return {
    useCases: {
      searchUsers: new SearchUsersUseCase(friendsRepository, friendsMapper),
      listFriends: new ListFriendsUseCase(friendsRepository, friendsMapper),
      listFriendRequests: new ListFriendRequestsUseCase(
        friendsRepository,
        friendsMapper,
      ),
      sendFriendRequest: new SendFriendRequestUseCase(
        friendsRepository,
        relationshipPolicy,
        friendsMapper,
      ),
      acceptFriendRequest: new AcceptFriendRequestUseCase(
        friendsRepository,
        friendsRepository,
        friendsMapper,
      ),
      declineFriendRequest: new DeclineFriendRequestUseCase(friendsRepository),
      cancelFriendRequest: new CancelFriendRequestUseCase(friendsRepository),
      removeFriend: new RemoveFriendUseCase(
        friendsRepository,
        relationshipPolicy,
      ),
    },
  };
};
