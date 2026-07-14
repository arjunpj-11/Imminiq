export type UserActivityEntityProps = {
  id: string;
  action: string;
  module: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export class UserActivityEntity {
  readonly id: string;
  readonly action: string;
  readonly module: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: Date;

  constructor(props: UserActivityEntityProps) {
    this.id = props.id;
    this.action = props.action;
    this.module = props.module;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt;
  }
}
