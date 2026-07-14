export type DashboardFriendEntityProps = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  lastActiveAt: Date | null;
  isOnline: boolean;
};

export class DashboardFriendEntity {
  readonly id: string;
  readonly fullName: string;
  readonly username: string;
  readonly avatarUrl: string;
  readonly lastActiveAt: Date | null;
  readonly isOnline: boolean;

  constructor(props: DashboardFriendEntityProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.username = props.username;
    this.avatarUrl = props.avatarUrl;
    this.lastActiveAt = props.lastActiveAt;
    this.isOnline = props.isOnline;
  }
}
