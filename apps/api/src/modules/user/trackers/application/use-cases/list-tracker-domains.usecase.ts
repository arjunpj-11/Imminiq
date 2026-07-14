import type { ITrackerQueryRepository } from '../../domain/repositories/tracker-query.repository.interface';

export interface IListTrackerDomainsUseCase {
  execute(search: string): Promise<string[]>;
}

export class ListTrackerDomainsUseCase implements IListTrackerDomainsUseCase {
  constructor(private readonly repository: Pick<ITrackerQueryRepository, 'listDomains'>) {}

  execute(search: string): Promise<string[]> {
    return this.repository.listDomains(search.trim(), 10);
  }
}
