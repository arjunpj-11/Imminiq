import type { ICallQueryRepository } from '../../domain/repositories/call-query.repository.interface';
import type { CallPageDTO, ListCallsInputDTO } from '../call.dto';
import type { ICallViewService } from '../services/call-view.service';

export interface IListCallsUseCase {
  execute(viewerUserId: string, input: ListCallsInputDTO): Promise<CallPageDTO>;
}

export class ListCallsUseCase implements IListCallsUseCase {
  constructor(
    private readonly _queries: Pick<ICallQueryRepository, 'listCalls'>,
    private readonly _views: ICallViewService
  ) {}

  async execute(viewerUserId: string, input: ListCallsInputDTO) {
    const page = await this._queries.listCalls({
      viewerUserId,
      page: input.page,
      limit: input.limit,
    });
    return {
      items: await Promise.all(page.items.map((call) => this._views.toView(call, viewerUserId))),
      pagination: {
        page: page.page,
        limit: page.limit,
        total: page.total,
        hasMore: page.hasMore,
      },
    };
  }
}
