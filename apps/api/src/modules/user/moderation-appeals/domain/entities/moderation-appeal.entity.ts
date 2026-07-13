import type { ModerationAppealStatus } from '../value-objects/moderation-appeal-status.vo';

export type ModerationAppealEntityProps = {
  id?: string;
  userId: string;
  caseId: string;
  status: ModerationAppealStatus;
  identifier: string;
  appealReason: string;
  createdAt: Date;
  updatedAt?: Date;
};

export class ModerationAppealEntity {
  readonly id?: string;
  readonly userId: string;
  readonly caseId: string;
  readonly status: ModerationAppealStatus;
  readonly identifier: string;
  readonly appealReason: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: ModerationAppealEntityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.caseId = props.caseId;
    this.status = props.status;
    this.identifier = props.identifier;
    this.appealReason = props.appealReason;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
