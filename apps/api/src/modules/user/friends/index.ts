export type {
  AcceptFriendRequestViewDTO,
  FriendActionViewDTO,
  FriendRequestViewDTO,
  FriendRequestsPageViewDTO,
  FriendUserViewDTO,
  FriendUsersPageViewDTO,
  ListFriendRequestsPayloadDTO,
  ListFriendsPayloadDTO,
  SearchUsersPayloadDTO,
  SendFriendRequestPayloadDTO,
  SendFriendRequestViewDTO,
} from './application/friends.dto';

export type { FriendRelationshipStatus } from './domain/friends.types';

export { createFriendsComposition } from './friends.factory';
export { createFriendsRoutes } from './presentation/friends.routes';
