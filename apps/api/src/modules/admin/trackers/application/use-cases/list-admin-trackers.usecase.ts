import type { AdminListQuery, AdminPage } from '../../../shared';
import type { AdminTracker } from '../../domain/entities/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';

export interface IListAdminTrackersUseCase {
  execute(query: AdminListQuery): Promise<AdminPage<AdminTracker>>;
}

export class ListAdminTrackersUseCase implements IListAdminTrackersUseCase {
  constructor(private readonly repository: IAdminTrackersRepository) {}

  execute(query: AdminListQuery) {
    return this.repository.list(query);
  }
}
