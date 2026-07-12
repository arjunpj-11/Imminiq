import type * as Application from '../index'
export type FriendsUseCases = {
  listFriends: Application.IListFriendsUseCase
  searchUsers: Application.ISearchUsersUseCase
  listFriendRequests: Application.IListFriendRequestsUseCase
  sendFriendRequest: Application.ISendFriendRequestUseCase
  acceptFriendRequest: Application.IAcceptFriendRequestUseCase
  declineFriendRequest: Application.IDeclineFriendRequestUseCase
  cancelFriendRequest: Application.ICancelFriendRequestUseCase
  removeFriend: Application.IRemoveFriendUseCase
}
