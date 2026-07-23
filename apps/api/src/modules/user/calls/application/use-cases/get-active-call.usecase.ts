import type { ICallQueryRepository } from '../../domain/repositories/call-query.repository.interface';
import type { CallViewDTO } from '../call.dto';
import type { ICallViewService } from '../services/call-view.service';

export interface IGetActiveCallUseCase {
  execute(viewerUserId: string): Promise<CallViewDTO | null>;
}

export class GetActiveCallUseCase implements IGetActiveCallUseCase {
  constructor(
    private readonly _queries: Pick<ICallQueryRepository, 'findActiveForUser'>,
    private readonly _views: ICallViewService
  ) {}

  async execute(viewerUserId: string) {
    const call = await this._queries.findActiveForUser(viewerUserId);
    return call ? this._views.toView(call, viewerUserId) : null;
  }
}
