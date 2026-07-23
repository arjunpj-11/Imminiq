import type { IFriendCommandRepository } from './friend-command.repository.interface';
import type { IFriendQueryRepository } from './friend-query.repository.interface';
import type { IFriendRequestRepository } from './friend-request.repository.interface';

export interface IFriendsRepository
  extends IFriendQueryRepository,
    IFriendRequestRepository,
    IFriendCommandRepository {}
