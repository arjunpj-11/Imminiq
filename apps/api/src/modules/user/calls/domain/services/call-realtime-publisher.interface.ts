import type { CallEntity } from '../entities/call.entity';
import type { CallParticipantEntity } from '../entities/call-participant.entity';

export type CallRealtimePayload = {
  call: CallEntity;
  caller: CallParticipantEntity;
  callee: CallParticipantEntity;
};

export interface ICallRealtimePublisher {
  incoming(userId: string, payload: CallRealtimePayload): void;
  updated(userId: string, payload: CallRealtimePayload): void;
}
