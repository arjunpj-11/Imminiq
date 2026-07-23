export type ChatParticipantEntityProps = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  level: number;
  lastActiveAt?: Date | null;
  presenceVisible?: boolean;
};

export class ChatParticipantEntity {
  readonly id: string;
  readonly fullName: string;
  readonly username: string;
  readonly avatarUrl?: string | null;
  readonly level: number;
  readonly lastActiveAt: Date | null;
  readonly presenceVisible: boolean;

  constructor(props: ChatParticipantEntityProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.username = props.username;
    if (props.avatarUrl !== undefined) this.avatarUrl = props.avatarUrl;
    this.level = props.level;
    this.lastActiveAt = props.lastActiveAt ?? null;
    this.presenceVisible = props.presenceVisible ?? true;
  }
}
