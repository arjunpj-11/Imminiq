import type { FriendshipStatus } from "../friends.types";

export type FriendEntityProps = {
  id: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class FriendEntity {
  readonly id: string;
  readonly userId: string;
  readonly friendId: string;
  readonly status: FriendshipStatus;
  readonly deletedAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: FriendEntityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.friendId = props.friendId;
    this.status = props.status;
    if (props.deletedAt !== undefined) {
      this.deletedAt = props.deletedAt;
    }
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
