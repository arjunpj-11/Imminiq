import { CallDomainError } from '../../domain/call-domain.error';
import type { ICallCommandRepository } from '../../domain/repositories/call-command.repository.interface';
import type { ICallQueryRepository } from '../../domain/repositories/call-query.repository.interface';
import type { ICallRelationshipRepository } from '../../domain/repositories/call-relationship.repository.interface';
import type { ICallRealtimePublisher } from '../../domain/services/call-realtime-publisher.interface';
import type { ICallTimeoutScheduler } from '../../domain/services/call-timeout-scheduler.interface';
import { CallApplicationError } from '../call-application.error';
import { CALL_RING_TIMEOUT_MS } from '../call.constants';
import type { CallViewDTO, InitiateCallInputDTO } from '../call.dto';
import type { ICallViewService } from '../services/call-view.service';

export interface IInitiateCallUseCase {
  execute(callerUserId: string, input: InitiateCallInputDTO): Promise<CallViewDTO>;
}

export class InitiateCallUseCase implements IInitiateCallUseCase {
  constructor(
    private readonly _commands: Pick<ICallCommandRepository, 'createCall'>,
    private readonly _queries: Pick<ICallQueryRepository, 'findActiveForUser'>,
    private readonly _relationships: ICallRelationshipRepository,
    private readonly _views: ICallViewService,
    private readonly _realtime: ICallRealtimePublisher,
    private readonly _timeouts: ICallTimeoutScheduler
  ) {}

  async execute(callerUserId: string, input: InitiateCallInputDTO) {
    if (callerUserId === input.calleeUserId) throw CallApplicationError.invalidParticipant();
    if (!(await this._relationships.areActiveFriends(callerUserId, input.calleeUserId))) {
      throw CallApplicationError.friendsOnly();
    }
    const [callerActive, calleeActive] = await Promise.all([
      this._queries.findActiveForUser(callerUserId),
      this._queries.findActiveForUser(input.calleeUserId),
    ]);
    if (callerActive || calleeActive) throw CallApplicationError.busy();

    const expiresAt = new Date(Date.now() + CALL_RING_TIMEOUT_MS);
    try {
      const call = await this._commands.createCall({
        callerId: callerUserId,
        calleeId: input.calleeUserId,
        type: input.type,
        reason: input.reason.trim(),
        expiresAt,
      });
      const bundle = await this._views.toParticipantBundle(call);
      const callerView = bundle.views.find((event) => event.userId === callerUserId)?.call;
      if (!callerView) throw CallApplicationError.participantNotFound();
      this._timeouts.schedule(call.id, call.expiresAt);
      this._realtime.incoming(input.calleeUserId, bundle.realtime);
      return callerView;
    } catch (error) {
      if (error instanceof CallDomainError && error.code === 'CALL_ACTIVE_CONFLICT') {
        throw CallApplicationError.busy();
      }
      throw error;
    }
  }
}
