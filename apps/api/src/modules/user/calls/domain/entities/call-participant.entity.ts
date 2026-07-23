export type CallParticipantEntityProps = {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
};

export class CallParticipantEntity {
  readonly id: string;
  readonly fullName: string;
  readonly username: string;
  readonly avatarUrl: string | null;

  constructor(props: CallParticipantEntityProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.username = props.username;
    this.avatarUrl = props.avatarUrl ?? null;
  }
}
