import type { ICallCommandRepository } from '../../domain/repositories/call-command.repository.interface';
import type { ICallQueryRepository } from '../../domain/repositories/call-query.repository.interface';
import type { ICallRealtimePublisher } from '../../domain/services/call-realtime-publisher.interface';
import type { ICallTimeoutScheduler } from '../../domain/services/call-timeout-scheduler.interface';
import { CallApplicationError } from '../call-application.error';
import type { CallViewDTO, RespondCallInputDTO } from '../call.dto';
import type { ICallViewService } from '../services/call-view.service';

export interface IRespondCallUseCase {
  execute(calleeUserId: string, callId: string, input: RespondCallInputDTO): Promise<CallViewDTO>;
}

export class RespondCallUseCase implements IRespondCallUseCase {
  constructor(
    private readonly _queries: Pick<ICallQueryRepository, 'findById'>,
    private readonly _commands: Pick<ICallCommandRepository, 'transitionCall'>,
    private readonly _views: ICallViewService,
    private readonly _realtime: ICallRealtimePublisher,
    private readonly _timeouts: ICallTimeoutScheduler
  ) {}

  async execute(calleeUserId: string, callId: string, input: RespondCallInputDTO) {
    const current = await this._queries.findById(callId);
    if (!current) throw CallApplicationError.notFound();
    if (current.calleeId !== calleeUserId) throw CallApplicationError.forbidden();
    if (current.status !== 'ringing') throw CallApplicationError.invalidState();

    const changed = await this._commands.transitionCall({
      callId,
      expectedStatus: 'ringing',
      status: input.response === 'accept' ? 'accepted' : 'declined',
      changedAt: new Date(),
    });
    if (!changed) throw CallApplicationError.invalidState();
    this._timeouts.cancel(callId);
    const bundle = await this._views.toParticipantBundle(changed);
    for (const event of bundle.views) this._realtime.updated(event.userId, bundle.realtime);
    return (
      bundle.views.find((event) => event.userId === calleeUserId)?.call ??
      bundle.views[0]!.call
    );
  }
}
