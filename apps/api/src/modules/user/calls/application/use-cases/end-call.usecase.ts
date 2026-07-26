import type { ICallCommandRepository } from '../../domain/repositories/call-command.repository.interface';
import type { ICallQueryRepository } from '../../domain/repositories/call-query.repository.interface';
import type { ICallRealtimePublisher } from '../../domain/services/call-realtime-publisher.interface';
import type { ICallTimeoutScheduler } from '../../domain/services/call-timeout-scheduler.interface';
import { CallApplicationError } from '../call-application.error';
import type { CallViewDTO, EndCallInputDTO } from '../call.dto';
import type { ICallViewService } from '../services/call-view.service';

export interface IEndCallUseCase {
  execute(viewerUserId: string, callId: string, input: EndCallInputDTO): Promise<CallViewDTO>;
}

export class EndCallUseCase implements IEndCallUseCase {
  constructor(
    private readonly _queries: Pick<ICallQueryRepository, 'findById'>,
    private readonly _commands: Pick<ICallCommandRepository, 'transitionCall'>,
    private readonly _views: ICallViewService,
    private readonly _realtime: ICallRealtimePublisher,
    private readonly _timeouts: ICallTimeoutScheduler
  ) {}

  async execute(viewerUserId: string, callId: string, input: EndCallInputDTO) {
    const current = await this._queries.findById(callId);
    if (!current) throw CallApplicationError.notFound();
    if (!current.includesParticipant(viewerUserId)) throw CallApplicationError.forbidden();

    const expectedStatus = input.outcome === 'ended' ? 'accepted' : 'ringing';
    if (current.status !== expectedStatus) throw CallApplicationError.invalidState();
    if (
      (input.outcome === 'missed' || input.outcome === 'cancelled') &&
      current.callerId !== viewerUserId
    ) {
      throw CallApplicationError.forbidden();
    }

    const changed = await this._commands.transitionCall({
      callId,
      expectedStatus,
      status: input.outcome,
      changedAt: new Date(),
      durationSeconds:
        input.outcome === 'ended' && current.acceptedAt
          ? Math.max(0, Math.floor((Date.now() - current.acceptedAt.getTime()) / 1000))
          : 0,
    });
    if (!changed) throw CallApplicationError.invalidState();
    this._timeouts.cancel(callId);
    const bundle = await this._views.toParticipantBundle(changed);
    for (const event of bundle.views) this._realtime.updated(event.userId, bundle.realtime);
    return (
      bundle.views.find((event) => event.userId === viewerUserId)?.call ?? bundle.views[0]!.call
    );
  }
}
