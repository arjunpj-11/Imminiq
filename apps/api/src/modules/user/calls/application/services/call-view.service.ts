import type { CallEntity } from '../../domain/entities/call.entity';
import type { ICallParticipantRepository } from '../../domain/repositories/call-participant.repository.interface';
import type { ICallRelationshipRepository } from '../../domain/repositories/call-relationship.repository.interface';
import type { CallRealtimePayload } from '../../domain/services/call-realtime-publisher.interface';
import { CallApplicationError } from '../call-application.error';
import type { CallViewDTO } from '../call.dto';
import type { ICallMapper } from '../call.mapper';

export interface ICallViewService {
  toView(call: CallEntity, viewerUserId: string): Promise<CallViewDTO>;
  toParticipantBundle(call: CallEntity): Promise<CallParticipantViewBundle>;
}

export type CallParticipantViewEvent = { userId: string; call: CallViewDTO };
export type CallParticipantViewBundle = {
  realtime: CallRealtimePayload;
  views: CallParticipantViewEvent[];
};

export class CallViewService implements ICallViewService {
  constructor(
    private readonly _participants: ICallParticipantRepository,
    private readonly _relationships: Pick<ICallRelationshipRepository, 'hasBlockBetween'>,
    private readonly _mapper: ICallMapper
  ) {}

  async toView(call: CallEntity, viewerUserId: string) {
    const bundle = await this.toParticipantBundle(call);
    const otherParticipantId = call.callerId === viewerUserId ? call.calleeId : call.callerId;
    const blocked = await this._relationships.hasBlockBetween(viewerUserId, otherParticipantId);
    return this._mapper.toView(
      call,
      bundle.realtime.caller,
      bundle.realtime.callee,
      viewerUserId,
      blocked
    );
  }

  async toParticipantBundle(call: CallEntity) {
    const participants = await this._participants.findParticipants(call.participantIds());
    const caller = participants.get(call.callerId);
    const callee = participants.get(call.calleeId);
    if (!caller || !callee) throw CallApplicationError.participantNotFound();
    return {
      realtime: { call, caller, callee },
      views: await Promise.all(
        call.participantIds().map(async (userId) => {
          const otherParticipantId = call.callerId === userId ? call.calleeId : call.callerId;
          const blocked = await this._relationships.hasBlockBetween(userId, otherParticipantId);
          return {
            userId,
            call: this._mapper.toView(call, caller, callee, userId, blocked),
          };
        })
      ),
    };
  }
}
