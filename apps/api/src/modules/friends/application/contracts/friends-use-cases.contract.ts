import type * as Application from '../index'
export type FriendsUseCases = {
  listFriends: Application.ListFriendsUseCase
  searchUsers: Application.SearchUsersUseCase
  listFriendRequests: Application.ListFriendRequestsUseCase
  sendFriendRequest: Application.SendFriendRequestUseCase
  acceptFriendRequest: Application.AcceptFriendRequestUseCase
  declineFriendRequest: Application.DeclineFriendRequestUseCase
  cancelFriendRequest: Application.CancelFriendRequestUseCase
  removeFriend: Application.RemoveFriendUseCase
}
