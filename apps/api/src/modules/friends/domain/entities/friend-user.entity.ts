import type { FriendRelationshipStatus } from "../types/friends.types";

export type FriendUserEntityProps = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  level: number;
  mutualCount: number;
  relationshipStatus: FriendRelationshipStatus;
};

export class FriendUserEntity {
  readonly id: string;
  readonly fullName: string;
  readonly username: string;
  readonly avatarUrl?: string | null;
  readonly level: number;
  readonly mutualCount: number;
  readonly relationshipStatus: FriendRelationshipStatus;

  constructor(props: FriendUserEntityProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.username = props.username;
    if (props.avatarUrl !== undefined) {
      this.avatarUrl = props.avatarUrl;
    }
    this.level = props.level;
    this.mutualCount = props.mutualCount;
    this.relationshipStatus = props.relationshipStatus;
  }
}
