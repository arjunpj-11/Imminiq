import type { FriendRequestEntity } from './friend-request.entity';
import type { FriendUserEntity } from './friend-user.entity';

export type FriendRequestDirection = 'received' | 'sent';

export type FriendRequestSummaryEntityProps = {
  request: FriendRequestEntity;
  user: FriendUserEntity;
  direction: FriendRequestDirection;
};

export class FriendRequestSummaryEntity {
  readonly request: FriendRequestEntity;
  readonly user: FriendUserEntity;
  readonly direction: FriendRequestDirection;

  constructor(props: FriendRequestSummaryEntityProps) {
    this.request = props.request;
    this.user = props.user;
    this.direction = props.direction;
  }
}
