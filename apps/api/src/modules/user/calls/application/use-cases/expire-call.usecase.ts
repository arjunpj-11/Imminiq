import type { ICallCommandRepository } from '../../domain/repositories/call-command.repository.interface';
import type { ICallQueryRepository } from '../../domain/repositories/call-query.repository.interface';
import type { ICallRealtimePublisher } from '../../domain/services/call-realtime-publisher.interface';
import type { ICallViewService } from '../services/call-view.service';

export interface IExpireCallUseCase {
  execute(callId: string): Promise<void>;
}

export class ExpireCallUseCase implements IExpireCallUseCase {
  constructor(
    private readonly _queries: Pick<ICallQueryRepository, 'findById'>,
    private readonly _commands: Pick<ICallCommandRepository, 'transitionCall'>,
    private readonly _views: ICallViewService,
    private readonly _realtime: ICallRealtimePublisher
  ) {}

  async execute(callId: string) {
    const current = await this._queries.findById(callId);
    if (!current || current.status !== 'ringing') return;
    const changed = await this._commands.transitionCall({
      callId,
      expectedStatus: 'ringing',
      status: 'missed',
      changedAt: new Date(),
    });
    if (!changed) return;
    const bundle = await this._views.toParticipantBundle(changed);
    for (const event of bundle.views) this._realtime.updated(event.userId, bundle.realtime);
  }
}
