import type { CallStatus, CallType } from '../call.types';

export type CallEntityProps = {
  id: string;
  callerId: string;
  calleeId: string;
  type: CallType;
  reason: string;
  status: CallStatus;
  acceptedAt?: Date | null;
  endedAt?: Date | null;
  durationSeconds?: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class CallEntity {
  readonly id: string;
  readonly callerId: string;
  readonly calleeId: string;
  readonly type: CallType;
  readonly reason: string;
  readonly status: CallStatus;
  readonly acceptedAt: Date | null;
  readonly endedAt: Date | null;
  readonly durationSeconds: number;
  readonly expiresAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: CallEntityProps) {
    this.id = props.id;
    this.callerId = props.callerId;
    this.calleeId = props.calleeId;
    this.type = props.type;
    this.reason = props.reason;
    this.status = props.status;
    this.acceptedAt = props.acceptedAt ?? null;
    this.endedAt = props.endedAt ?? null;
    this.durationSeconds = Math.max(0, Math.floor(props.durationSeconds ?? 0));
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  participantIds() {
    return [this.callerId, this.calleeId];
  }

  includesParticipant(userId: string) {
    return this.callerId === userId || this.calleeId === userId;
  }
}
