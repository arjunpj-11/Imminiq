import { emitCallIncoming, emitCallUpdated } from '../../../../../infrastructure/realtime/socket';
import { CallMapper, type ICallMapper } from '../../application/call.mapper';
import type { CallRealtimePayload } from '../../domain/services/call-realtime-publisher.interface';
import type { ICallRealtimePublisher } from '../../domain/services/call-realtime-publisher.interface';

export class SocketCallRealtimePublisher implements ICallRealtimePublisher {
  constructor(private readonly _mapper: ICallMapper = new CallMapper()) {}

  incoming(userId: string, payload: CallRealtimePayload): void {
    emitCallIncoming(
      userId,
      this._mapper.toView(payload.call, payload.caller, payload.callee, userId)
    );
  }

  updated(userId: string, payload: CallRealtimePayload): void {
    emitCallUpdated(
      userId,
      this._mapper.toView(payload.call, payload.caller, payload.callee, userId)
    );
  }
}

export const socketCallRealtimePublisher = new SocketCallRealtimePublisher();
