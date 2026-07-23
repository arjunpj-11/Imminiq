import type { CallEntity } from '../entities/call.entity';
import type { CallStatus, CallType } from '../call.types';

export type CreateCallInput = {
  callerId: string;
  calleeId: string;
  type: CallType;
  reason: string;
  expiresAt: Date;
};

export type TransitionCallInput = {
  callId: string;
  expectedStatus: CallStatus;
  status: CallStatus;
  changedAt: Date;
  durationSeconds?: number;
};

export interface ICallCommandRepository {
  createCall(input: CreateCallInput): Promise<CallEntity>;
  transitionCall(input: TransitionCallInput): Promise<CallEntity | null>;
}
