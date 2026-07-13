import type { FriendRequestStatus } from "../friends.types";

export type FriendRequestEntityProps = {
  id: string;
  senderId: string;
  receiverId: string;
  pairKey: string;
  status: FriendRequestStatus;
  message: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class FriendRequestEntity {
  readonly id: string;
  readonly senderId: string;
  readonly receiverId: string;
  readonly pairKey: string;
  readonly status: FriendRequestStatus;
  readonly message: string;
  readonly deletedAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: FriendRequestEntityProps) {
    this.id = props.id;
    this.senderId = props.senderId;
    this.receiverId = props.receiverId;
    this.pairKey = props.pairKey;
    this.status = props.status;
    this.message = props.message;
    if (props.deletedAt !== undefined) {
      this.deletedAt = props.deletedAt;
    }
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
